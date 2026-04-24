document.addEventListener('DOMContentLoaded', () => {
    // العناصر الخاصة بالعرض (Contract Display)
    const contractDateDisplay = document.getElementById('contractDateText');
    const contractDateFull = document.getElementById('contractDateFull');
    const contractDateTextInClauses = document.querySelectorAll('#contractDateText');

    const contractDFull = document.getElementById('contractDFull');
    
    const contractSellerName = document.getElementById('contractSellerName');
    const contractSellerJob = document.getElementById('contractSellerJob');
    const contractSellerAddress = document.getElementById('contractSellerAddress');
    const contractSellerId = document.getElementById('contractSellerId');
    const contractSellerPhone = document.getElementById('contractSellerPhone');
    
    const contractBuyerName = document.getElementById('contractBuyerName');
    const contractBuyerJob = document.getElementById('contractBuyerJob');
    const contractBuyerAddress = document.getElementById('contractBuyerAddress');
    const contractBuyerId = document.getElementById('contractBuyerId');
    const contractBuyerPhone = document.getElementById('contractBuyerPhone');
    
    const contractCarNumber = document.getElementById('contractCarNumber');
    const contractCarType = document.getElementById('contractCarType');
    const contractCarBrand = document.getElementById('contractCarBrand');
    const contractCarModel = document.getElementById('contractCarModel');
    const contractCarSize = document.getElementById('contractCarSize');
    const contractCarColor = document.getElementById('contractCarColor'); 
    const contractChassisNumber = document.getElementById('contractChassisNumber');
    
    const contractPrice = document.getElementById('contractPrice');
    const contractPriceText = document.getElementById('contractPriceText');
    const contractDeposit = document.getElementById('contractDeposit');
    const contractRemainingAmount = document.getElementById('contractRemainingAmount');
    const contractAdditionalNotes = document.getElementById('contractAdditionalNotes');
    
    const contractSellerSignature = document.getElementById('contractSellerSignature');
    const contractBuyerSignature = document.getElementById('contractBuyerSignature');
    
    // عناصر الإدخال (Inputs)
    const contractDateInput = document.getElementById('contractDate');
    const contractDInput = document.getElementById('contractD');
    const sellerNameInput = document.getElementById('sellerName');
    const sellerJobInput = document.getElementById('sellerJob');
    const sellerAddressInput = document.getElementById('sellerAddress');
    const sellerIdInput = document.getElementById('sellerId');
    const sellerPhoneInput = document.getElementById('sellerPhone');
    const buyerNameInput = document.getElementById('buyerName');
    const buyerJobInput = document.getElementById('buyerJob');
    const buyerAddressInput = document.getElementById('buyerAddress');
    const buyerIdInput = document.getElementById('buyerId');
    const buyerPhoneInput = document.getElementById('buyerPhone');
    const carNumberInput = document.getElementById('carNumber');
    const carTypeInput = document.getElementById('carType');
    const carBrandInput = document.getElementById('carBrand');
    const carModelInput = document.getElementById('carModel');
    const carSizeInput = document.getElementById('carSize');
    const carColorInput = document.getElementById('carColor');
    const chassisNumberInput = document.getElementById('chassisNumber');
    const priceInput = document.getElementById('price');
    const depositInput = document.getElementById('deposit');
    const remainingAmountInput = document.getElementById('remainingAmount');
    const additionalNotesInput = document.getElementById('additionalNotesInput');
    const currencyInput = document.getElementById('currency'); 

    // أزرار التحكم
    const updateContractBtn = document.getElementById('updateContract');
    const printContractBtn = document.getElementById('printContract');
    const resetFormBtn = document.getElementById('resetForm');
    
    // دالة تحويل الأرقام إلى كلمات (تفقيط)
    function convertNumberToArabicWords(num) {
        if (!num || isNaN(num) || num === 0) return "صفر";
        const units = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
        const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
        const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
        const hundreds = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
        const bigUnits = ["", "ألف", "مليون", "مليار"];
    
        let number = Math.floor(Math.abs(num));
        let result = "";
    
        function toWords(n) {
            let s = "";
            if (n >= 100) { s += hundreds[Math.floor(n / 100)]; n %= 100; if (n > 0) s += " و "; }
            if (n >= 20) { s += tens[Math.floor(n / 10)]; n %= 10; if (n > 0) s += " و "; }
            if (n >= 10) { s += teens[n - 10]; } else if (n > 0) { s += units[n]; }
            return s;
        }
    
        let i = 0;
        while (number > 0) {
            let chunk = number % 1000;
            if (chunk > 0) {
                let chunkWords = toWords(chunk);
                if (i === 1) {
                    if (chunk === 1) chunkWords = "ألف";
                    else if (chunk === 2) chunkWords = "ألفين";
                    else if (chunk >= 3 && chunk <= 10) chunkWords += " آلاف";
                    else chunkWords += " ألف";
                } else if (i > 1) {
                    chunkWords += " " + bigUnits[i];
                }
                result = (result !== "") ? chunkWords + " و " + result : chunkWords;
            }
            number = Math.floor(number / 1000);
            i++;
        }
        return result.trim();
    }
    
    function updateContract() {
        // تحديث التاريخ
        const dateValue = contractDateInput.value;
        if (dateValue) {
            const dateObj = new Date(dateValue);
            const formattedDate = dateObj.toLocaleDateString('ar-EG');
            if (contractDateDisplay) contractDateDisplay.textContent = formattedDate;
            if (contractDateFull) contractDateFull.textContent = formattedDate;
            contractDateTextInClauses.forEach(el => el.textContent = formattedDate);
        }

        // --- تحديث العملة ---
        const selectedCurrency = currencyInput ? currencyInput.value : "دينار عراقي";
        // استبدال النص في جميع الأماكن التي تحمل كلاس currency-label
        document.querySelectorAll('.currency-label').forEach(el => {
            el.textContent = selectedCurrency;
        });

        // تحديث بيانات البائع والمشتري
        if(contractDFull && contractDInput) contractDFull.textContent = contractDInput.value;
        contractSellerName.textContent = sellerNameInput.value || '.....................';
        contractSellerJob.textContent = sellerJobInput.value || '.....................';
        contractSellerAddress.textContent = sellerAddressInput.value || '.....................';
        contractSellerId.textContent = sellerIdInput.value || '.....................';
        contractSellerPhone.textContent = sellerPhoneInput.value || '.....................';
        contractBuyerName.textContent = buyerNameInput.value || '.....................';
        contractBuyerJob.textContent = buyerJobInput.value || '.....................';
        contractBuyerAddress.textContent = buyerAddressInput.value || '.....................';
        contractBuyerId.textContent = buyerIdInput.value || '.....................';
        contractBuyerPhone.textContent = buyerPhoneInput.value || '.....................';
        
        // بيانات السيارة
        contractCarNumber.textContent = carNumberInput.value || '.....................';
        contractCarType.textContent = carTypeInput.value || '.....................';
        contractCarBrand.textContent = carBrandInput.value || '.....................';
        contractCarModel.textContent = carModelInput.value || '.....................';
        contractCarSize.textContent = carSizeInput.value || '.....................';
        contractCarColor.textContent = carColorInput.value || '.....................';
        contractChassisNumber.textContent = chassisNumberInput.value || '.....................';
    
        // البيانات المالية والتفقيط
        const price = parseFloat(priceInput.value) || 0;
        const deposit = parseFloat(depositInput.value) || 0;
        const remaining = price - deposit;
    
        contractPrice.textContent = price.toLocaleString('en-US'); 
        // هنا يتم دمج التفقيط مع العملة المختارة
        contractPriceText.textContent = convertNumberToArabicWords(price) + " " + selectedCurrency;
        
        contractDeposit.textContent = deposit.toLocaleString('en-US');
        contractRemainingAmount.textContent = remaining.toLocaleString('en-US');
        remainingAmountInput.value = remaining.toLocaleString('en-US');
    
        contractAdditionalNotes.textContent = additionalNotesInput.value || 'لا توجد ملاحظات إضافية.';
        contractSellerSignature.textContent = sellerNameInput.value || '.....................';
        contractBuyerSignature.textContent = buyerNameInput.value || '.....................';
    }
    
    // التشغيل الأولي
    const today = new Date();
    contractDateInput.value = today.toISOString().split('T')[0];
    updateContract();
    
    // الأحداث
    if (updateContractBtn) updateContractBtn.addEventListener('click', updateContract);
    if (printContractBtn) printContractBtn.addEventListener('click', () => window.print());
    
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            document.querySelectorAll('.form-section input, .form-section textarea').forEach(input => input.value = '');
            contractDateInput.value = new Date().toISOString().split('T')[0];
            updateContract();
        });
    }
    
    document.querySelectorAll('.form-section input, .form-section select, .form-section textarea').forEach(input => {
        input.addEventListener('input', updateContract);
        input.addEventListener('change', updateContract);
    });
});
