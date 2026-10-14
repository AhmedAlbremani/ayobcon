import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, collection, getDocs, query, orderBy, limit, startAfter, doc, runTransaction } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';
const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);
const byId=n=>document.getElementById(n);
let signedIn=null, docs=[], cursor=null, complete=false, busy=false;
const status=(message,err=false)=>{byId('status').textContent=message;byId('status').style.color=err?'#a12626':'#175b37';};
const safe=v=>String(v??'').trim();
const normalize=v=>safe(v).toLocaleLowerCase('ar');
function render(){
  const needle=normalize(byId('search').value);
  const matches=docs.filter(snapshot=>{const data=snapshot.data(), f=data.fields||{};return [data.number,f.sellerName,f.buyerName,f.carNumber,f.chassisNumber,f.contractDate].some(value=>normalize(value).includes(needle));});
  byId('records').replaceChildren();
  for(const snapshot of matches){
    const data=snapshot.data(), f=data.fields||{};
    const item=document.createElement('article');item.className='item';
    const info=document.createElement('div');info.className='info';
    const title=document.createElement('strong');title.textContent=`عقد رقم ${data.number}`;
    const sub=document.createElement('div');sub.className='muted';sub.textContent=`البائع: ${safe(f.sellerName)||'—'} | المشتري: ${safe(f.buyerName)||'—'} | التاريخ: ${safe(f.contractDate)||'—'} | السيارة: ${safe(f.carNumber)||'—'}`;
    info.append(title,sub);
    const actions=document.createElement('div');actions.className='actions';
    const open=document.createElement('button');open.className='open';open.textContent='فتح العقد';open.addEventListener('click',()=>{location.assign(`index.html?contract=${encodeURIComponent(data.number)}`);});
    const del=document.createElement('button');del.className='delete';del.textContent='حذف العقد';
    del.addEventListener('click',async()=>{
      if(!signedIn || busy)return;
      if(data.createdBy!==signedIn.uid){status('الحذف متاح فقط للحساب الذي أصدر هذا العقد.',true);return;}
      if(!confirm(`هل تريد حذف العقد رقم ${data.number} نهائياً؟ لا يمكن التراجع عن الحذف.`))return;
      busy=true;del.disabled=true;
      try{
        await runTransaction(db,async tx=>{
          const target=doc(db,'contracts',String(data.number));
          const old=await tx.get(target);
          if(!old.exists())throw Error('تم حذف العقد من قبل مستخدم آخر.');
          if(old.data().createdBy!==signedIn.uid)throw Error('غير مخوّل بحذف العقد.');
          tx.delete(target);
          if(old.data().verificationId)tx.delete(doc(db,'publicVerifications',old.data().verificationId));
        });
        docs=docs.filter(s=>s.id!==snapshot.id);render();status(`تم حذف العقد ${data.number}. لن يُعاد استخدام رقمه.`);}
      catch(error){status('تعذر حذف العقد: '+(error.message||error),true);}
      finally{busy=false;del.disabled=false;}
    });
    actions.append(open,del);item.append(info,actions);byId('records').append(item);
  }
  byId('empty').textContent=matches.length?'':(complete?'لا توجد عقود مطابقة.':'لا يوجد تطابق في العقود المحمّلة. اضغط تحميل المزيد للبحث في الأقدم.');
  byId('more').hidden=complete;
  if(needle&&!complete)status('البحث يشمل العقود المحمّلة. قد توجد نتائج أقدم؛ اضغط تحميل المزيد.');
}
async function loadNext(){
  if(!signedIn||busy||complete)return;
  busy=true;byId('more').disabled=true;
  try{let q=query(collection(db,'contracts'),orderBy('number','desc'),limit(100));if(cursor)q=query(collection(db,'contracts'),orderBy('number','desc'),startAfter(cursor),limit(100));const result=await getDocs(q);docs.push(...result.docs);if(result.docs.length)cursor=result.docs[result.docs.length-1];complete=result.docs.length<100;render();status(`تم تحميل ${docs.length} عقد${complete?' (كامل السجل)':''}.`);}
  catch(error){status('تعذر قراءة العقود: '+(error.message||error),true);}
  finally{busy=false;byId('more').disabled=false;}
}
byId('search').addEventListener('input',render);
byId('more').addEventListener('click',loadNext);
byId('refresh').addEventListener('click',()=>{if(busy)return;docs=[];cursor=null;complete=false;loadNext();});
onAuthStateChanged(auth,account=>{
 signedIn=account;
 if(account){byId('gate').style.display='none';if(!docs.length)loadNext();}
 else{byId('gate').style.display='flex';byId('gate-message').textContent='يجب تسجيل الدخول من صفحة إصدار العقد أولاً.';byId('records').replaceChildren();}
});
