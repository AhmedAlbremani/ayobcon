import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy, limit, startAfter, runTransaction, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const fields = ['contractDate','sellerName','sellerJob','sellerAddress','sellerId','sellerPhone','buyerName','buyerJob','buyerAddress','buyerId','buyerPhone','carNumber','carType','carBrand','carModel','carSize','carColor','chassisNumber','currency','price','deposit','additionalNotesInput'];
const id = name => document.getElementById(name);
const nativePrint = window.print.bind(window);
const configured = firebaseConfig.apiKey !== 'PASTE_API_KEY_HERE' && !firebaseConfig.projectId.startsWith('PASTE_');
const app = configured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
let user = null, currentNumber = null, currentRevision = null, busy = false, dirty = false;
let candidateNumber = null, archiveItems = [], archiveCursor = null, archiveDone = false;
let verificationId = null;

const style = document.createElement('style');
style.textContent = `
#fb-login {position:fixed;inset:0;z-index:99999;background:#eef1f5;display:flex;justify-content:center;align-items:center;font-family:Cairo,Arial,sans-serif;padding:14px;box-sizing:border-box}
#fb-login section{background:#fff;border-radius:15px;box-shadow:0 8px 40px #0002;padding:28px;width:min(420px,100%);direction:rtl;text-align:right}
#fb-login input{width:100%;box-sizing:border-box;padding:12px;margin:8px 0;border:1px solid #bbb;border-radius:7px;font-size:16px}
#fb-login button,#fb-tools button{cursor:pointer;border:0;border-radius:7px;padding:9px 13px;background:#185a8b;color:white;font-family:inherit;margin:4px}
#fb-login button{width:100%;margin-top:12px}#fb-tools{direction:rtl;margin:12px auto;padding:12px;background:#f4f7fa;border:1px solid #d6e0ea;border-radius:10px;font-family:Cairo,Arial,sans-serif;text-align:right}
#fb-tools input{max-width:150px;padding:9px;border:1px solid #aaa;border-radius:6px}#fb-tools .fb-status{display:block;margin-top:8px;font-weight:bold}#fb-tools #fb-history{margin-top:8px;display:none;max-height:440px;overflow:auto}
#fb-tools #fb-history button{display:block;text-align:right;background:#edf4fb;color:#123;width:100%;border:1px solid #cbd7e0}
#fb-tools button:disabled{opacity:.5;cursor:wait}
#fb-tools #fb-history input{box-sizing:border-box;max-width:none;width:100%;margin:6px 0 10px}
#fb-tools #fb-history .fb-archive-scroll{max-height:320px;overflow:auto}
#fb-tools #fb-history .fb-muted{display:block;padding:8px;color:#566}
#fb-tools #fb-history .fb-load-more{background:#185a8b;color:white;width:auto}
#fb-tools .fb-hint{font-size:12px;color:#475569}body:not(.fb-authed)>.container{display:none!important}
@media print{#fb-tools,#fb-login{display:none!important}}
`;
document.head.append(style);

const login = document.createElement('div');
login.id='fb-login';
login.innerHTML=`<section><h2>تسجيل الدخول إلى نظام العقود</h2><p>يرجى تسجيل الدخول قبل عرض أو إصدار العقود.</p><form id="fb-login-form"><label>البريد الإلكتروني<input id="fb-email" type="email" autocomplete="username" required></label><label>كلمة المرور<input id="fb-password" type="password" autocomplete="current-password" required></label><button type="submit" id="fb-login-submit">دخول</button></form><p id="fb-login-message" role="alert"></p></section>`;
document.body.append(login);
const tools = document.createElement('div');
tools.id='fb-tools';
tools.innerHTML=`<div><strong>إدارة العقود الإلكترونية</strong> — <span id="fb-email-view"></span> <button type="button" id="fb-logout">تسجيل الخروج</button></div><div><button type="button" id="fb-new">عقد جديد</button><button type="button" id="fb-save">حفظ العقد</button><button type="button" id="fb-open">استدعاء العقد / بحث في المحفوظات</button></div><span class="fb-status" role="status" id="fb-status">—</span>`;
const container = document.querySelector('body > .container');
container?.insertBefore(tools, container.children[1]);
// The contract's original HTML and CSS are untouched. This adds controls only.
const contractD = id('contractD');
if(contractD){contractD.readOnly=true;contractD.tabIndex=-1;contractD.title='رقم تلقائي — يُعتمد عند الحفظ';}
const message = (text, error=false) => { id('fb-status').textContent=text; id('fb-status').style.color=error?'#a12626':'#175b37'; };
const errorText = err => ({'auth/invalid-credential':'البريد أو كلمة المرور غير صحيحة.','auth/too-many-requests':'محاولات كثيرة؛ حاول لاحقاً.','permission-denied':'تم رفض العملية: افحص حساب المستخدم وقواعد Firestore.','unavailable':'قاعدة البيانات غير متاحة. تحقق من الإنترنت.'}[err?.code] || err?.message || String(err));
const serialize = () => Object.fromEntries(fields.map(key=>[key, id(key)?.value ?? '']));
const refreshPreview = () => id('updateContract')?.click();
const restore = data => { fields.forEach(key=>{if(id(key)) id(key).value = data[key] ?? '';}); refreshPreview(); };
const setNumber = num => {if(contractD) contractD.value=num == null?'':String(num);refreshPreview();};
const codeFor = (num, token) => `IQ-${num}-${token.replaceAll('-', '').toUpperCase()}`;
function updateSeal() {
 const seal=id('qr-seal'), placeholder=id('qr-placeholder'), node=id('qr-image');
 if(!seal || !node)return;
 node.replaceChildren();
 const show = Number.isSafeInteger(currentNumber) && verificationId;
 seal.hidden=!show; if(placeholder)placeholder.hidden=Boolean(show);
 if(!show)return;
 const code=codeFor(currentNumber,verificationId);
 id('qr-unique').textContent=code;
 const url=new URL('verify.html',location.href);
 url.searchParams.set('id',verificationId);
 if(typeof QRCode==='undefined'){message('مكتبة QR لم تُحمّل. افحص الاتصال بالإنترنت قبل الطباعة.',true);return;}
 new QRCode(node,{text:url.href,width:100,height:100,correctLevel:QRCode.CorrectLevel.M});
}


async function suggestNumber() {
  if(!user || currentNumber!==null)return;
  const snapshot=await getDoc(doc(db,'metadata','contractCounter'));
  const next=snapshot.exists()? snapshot.data().lastNumber+1:1001;
  if(!Number.isSafeInteger(next))throw Error('عداد العقود غير صالح.');
  candidateNumber=next;
  setNumber(next);
  message(`رقم العقد المتوقع: ${next} — يتم تثبيت الرقم عند حفظ العقد، وقد يتغير إذا حفظ مستخدم آخر قبلك.`);
}
function resetNew(skipSuggestion=false) {
  currentNumber=null; currentRevision=null;
  id('resetForm')?.click();
  if(id('currency')) id('currency').selectedIndex=0;
  if(id('contractDate')) {const date=new Date(); const local=new Date(date.getTime()-date.getTimezoneOffset()*60000); id('contractDate').value=local.toISOString().slice(0,10);}
  candidateNumber=null;verificationId=null;setNumber(null);updateSeal();dirty=false;
  message('جارٍ جلب رقم العقد التلقائي...');
  if(!skipSuggestion)suggestNumber().catch(err=>message('سيُعطى العقد رقماً تلقائياً عند الحفظ. '+errorText(err),true));
}
async function loadContract(num) {
  if (!Number.isSafeInteger(num) || num < 1001) throw Error('أدخل رقم عقد صحيحاً (1001 أو أكبر).');
  const snap=await getDoc(doc(db,'contracts',String(num)));
  if (!snap.exists()) throw Error('العقد غير موجود.');
  const data=snap.data();
  restore(data.fields); currentNumber=num;currentRevision=data.revision;verificationId=data.verificationId||null;setNumber(num);updateSeal();dirty=false;
  message(`تم فتح العقد ${num}. التعديل عليه سيحفظ بنفس الرقم.`);
}
const withBusy = async fn => {if(busy||!user)return;busy=true;tools.querySelectorAll('button').forEach(b=>b.disabled=true);try{await fn();}catch(err){message(errorText(err),true);}finally{busy=false;tools.querySelectorAll('button').forEach(b=>b.disabled=false);}};
async function save() {
  const values=serialize();
  if(!values.sellerName.trim() || !values.buyerName.trim()) throw Error('يجب إدخال اسمي البائع والمشتري قبل الحفظ.');
  const counter=doc(db,'metadata','contractCounter');
  if(currentNumber===null) {
    const number=await runTransaction(db,async tx=>{
      const state=await tx.get(counter);
      const next=state.exists()?state.data().lastNumber+1:1001;
      if(!Number.isSafeInteger(next))throw Error('انتهى نطاق أرقام العقود المسموح.');
      const target=doc(db,'contracts',String(next));
      const exists=await tx.get(target);
      if(exists.exists())throw Error('يوجد عقد بهذا الرقم؛ يجب إصلاح العداد بواسطة المسؤول.');
      const token=crypto.randomUUID().replaceAll('-','');
      tx.set(counter,{lastNumber:next});
      tx.set(target,{number:next,fields:values,verificationId:token,revision:1,createdBy:user.uid,updatedBy:user.uid,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      tx.set(doc(db,'publicVerifications',token),{number:next,code:codeFor(next,token),createdAt:serverTimestamp()});
      return {number:next,token};
    });
    currentNumber=number.number;currentRevision=1;verificationId=number.token;candidateNumber=null;setNumber(currentNumber);updateSeal();dirty=false;message(`تم إصدار وحفظ العقد رقم ${currentNumber} بنجاح.`);
  } else {
    const number=currentNumber, expectedRevision=currentRevision;
    const target=doc(db,'contracts',String(number));
    let mintedToken=null;
    const revision=await runTransaction(db,async tx=>{
      const state=await tx.get(target);
      if(!state.exists())throw Error('هذا العقد لم يعد موجوداً.');
      if(state.data().revision!==expectedRevision)throw Error('تم تعديل العقد من جهاز آخر. أعد استدعاءه قبل التعديل لمنع ضياع البيانات.');
      const existingToken=state.data().verificationId;
      if(existingToken){
        tx.update(target,{fields:values,revision:expectedRevision+1,updatedBy:user.uid,updatedAt:serverTimestamp()});
      } else {
        // One-time QR migration for contracts created before this update.
        const token=crypto.randomUUID().replaceAll('-','');
        tx.update(target,{fields:values,verificationId:token,revision:expectedRevision+1,updatedBy:user.uid,updatedAt:serverTimestamp()});
        tx.set(doc(db,'publicVerifications',token),{number,code:codeFor(number,token),createdAt:serverTimestamp()});
        mintedToken=token;
      }
      return expectedRevision+1;
    });
    currentRevision=revision;if(mintedToken)verificationId=mintedToken;updateSeal();dirty=false;message(`تم تحديث العقد ${number} بنجاح مع الاحتفاظ برقمه.`);
  }
}
id('fb-login-form').addEventListener('submit',async e=>{e.preventDefault();if(!configured)return;id('fb-login-submit').disabled=true;id('fb-login-message').textContent='جارٍ تسجيل الدخول...';try{await signInWithEmailAndPassword(auth,id('fb-email').value.trim(),id('fb-password').value);}catch(err){id('fb-login-message').textContent=errorText(err);}finally{id('fb-login-submit').disabled=false;}});
id('fb-logout').addEventListener('click',()=>withBusy(()=>signOut(auth)));
id('fb-new').addEventListener('click',()=>{if(!dirty||confirm('ستفقد التغييرات غير المحفوظة. متابعة؟'))resetNew();});
id('fb-save').addEventListener('click',()=>withBusy(save));
// The archive opens directly when clicking "استدعاء العقد", without asking for a number.
// Open a dedicated archive page rather than embedding records in the contract form.
id('fb-open').addEventListener('click',()=>{window.location.assign('archive.html');});
const selected = new URLSearchParams(location.search).get('contract');
fields.forEach(key=>id(key)?.addEventListener('input',()=>{if(user){dirty=true;message('يوجد تعديل لم يُحفظ بعد.');}}));
id('resetForm')?.addEventListener('click',()=>{if(!user)return;currentNumber=null;currentRevision=null;candidateNumber=null;verificationId=null;dirty=false;setNumber(null);updateSeal();suggestNumber().catch(err=>message(errorText(err),true));});
id('printContract')?.addEventListener('click',e=>{if(!user||currentNumber===null||dirty||!verificationId||!id('qr-image')?.querySelector('canvas, img')){e.stopImmediatePropagation();e.preventDefault();message('احفظ العقد أولاً وتأكد من ظهور رمز QR قبل الطباعة.',true);}},true);
window.print=()=>{if(!user||currentNumber===null||dirty||!verificationId||!id('qr-image')?.querySelector('canvas, img')){message('يجب حفظ العقد وظهور رمز QR قبل الطباعة.',true);return;}nativePrint();};
window.addEventListener('beforeunload',e=>{if(user&&dirty){e.preventDefault();e.returnValue='';}});
if(configured){onAuthStateChanged(auth,account=>{
 user=account;
 document.body.classList.toggle('fb-authed',Boolean(account));
 login.style.display=account?'none':'flex';
 id('fb-email-view').textContent=account?.email||'';
 if(account){
   id('fb-password').value=''; resetNew(Boolean(selected));
   if(selected && /^\d+$/.test(selected)){
     const number=Number(selected);
     if(Number.isSafeInteger(number) && number>=1001){
       withBusy(()=>loadContract(number)).then(()=>{ history.replaceState(null,'',location.pathname); });
     }
   }
 }
 else{currentNumber=null;currentRevision=null;dirty=false;archiveItems=[];archiveCursor=null;archiveDone=false;verificationId=null;updateSeal();}
});}else{id('fb-login-message').textContent='يلزم ضبط إعدادات Firebase في js/firebase-config.js ثم إعادة رفع الملفات.';id('fb-login-submit').disabled=true;}
