document.addEventListener('DOMContentLoaded', () => {
    // Get elements for contract display
    const contractDateDisplay = document.getElementById('contractDateText');
    const contractDateFull = document.getElementById('contractDateFull');
    const contractDateTextInClauses = document.querySelectorAll('#contractDateText');

 const contractDeDisplay = document.getElementById('contractDText');
    const contractDFull = document.getElementById('contractDFull');
    const contractDTextInClauses = document.querySelectorAll('#contractDText');
    
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
    
    // Get input elements
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
    
    // Buttons
    const updateContractBtn = document.getElementById('updateContract');
    const printContractBtn = document.getElementById('printContract');
    const resetFormBtn = document.getElementById('resetForm');
    
    // Helper function to convert number to Arabic text
    function convertNumberToArabicWords(num) {
        if (num === null || isNaN(num) || num === 0) {
            return "صفر";
        }
    
        const units = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
        const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
        const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
        const hundreds = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
        const thousands = ["", "ألف", "ألفين", "ثلاثة آلاف", "أربعة آلاف", "خمسة آلاف", "ستة آلاف", "سبعة آلاف", "ثمانية آلاف", "تسعة آلاف"];
        const bigUnits = ["", "ألف", "مليون", "مليار", "تريليون"];
    
        let number = Math.floor(Math.abs(num));
        let result = "";
    
        if (number === 0) {
            return "صفر";
        }
    
        function toWords(n) {
            let s = "";
            if (n >= 100) {
                s += hundreds[Math.floor(n / 100)];
                n %= 100;
                if (n > 0) s += " و";
            }
            if (n >= 20) {
                s += tens[Math.floor(n / 10)];
                n %= 10;
                if (n > 0) s += " و";
            }
            if (n >= 10) {
                s += teens[n - 10];
            } else if (n > 0) {
                s += units[n];
            }
            return s;
        }
    
        let i = 0;
        while (number > 0) {
            let chunk = number % 1000;
            if (chunk > 0) {
                let chunkWords = toWords(chunk);
                if (i === 1 && chunk === 1) {
                    chunkWords = "ألف";
                } else if (i === 1 && chunk === 2) {
                    chunkWords = "ألفين";
                } else if (i === 1 && chunk >= 3 && chunk <= 10) {
                    chunkWords += " آلاف";
                } else if (i > 0 && chunk > 2) {
                    chunkWords += " " + bigUnits[i];
                } else if (i > 0 && chunkWords !== "" && i < bigUnits.length) {
                    chunkWords += " " + bigUnits[i];
                }
                
                if (result !== "") {
                    result = chunkWords + " و" + result;
                } else {
                    result = chunkWords;
                }
            }
            number = Math.floor(number / 1000);
            i++;
        }
        return result.trim();
    }
    
    // Function to update the contract display
    function updateContract() {
        // Date
        const dateValue = contractDateInput.value;
        if (dateValue) {
            const dateObj = new Date(dateValue);
            const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
            const formattedDate = dateObj.toLocaleDateString('ar-EG', options);
            
            // Update all date elements
            if (contractDateDisplay) contractDateDisplay.textContent = formattedDate;
            if (contractDateFull) contractDateFull.textContent = formattedDate;
            contractDateTextInClauses.forEach(el => el.textContent = formattedDate);
        } else {
            if (contractDateDisplay) contractDateDisplay.textContent = '';
            if (contractDateFull) contractDateFull.textContent = '';
            contractDateTextInClauses.forEach(el => el.textContent = '.....................');
        }
    
        // Seller Data
contractDFull.textContent= contractD.value ;
        contractSellerName.textContent = sellerNameInput.value || '.....................';
        contractSellerJob.textContent = sellerJobInput.value || '.....................';
        contractSellerAddress.textContent = sellerAddressInput.value || '.....................';
        contractSellerId.textContent = sellerIdInput.value || '.....................';
        contractSellerPhone.textContent = sellerPhoneInput.value || '.....................';
    
        // Buyer Data
        contractBuyerName.textContent = buyerNameInput.value || '.....................';
        contractBuyerJob.textContent = buyerJobInput.value || '.....................';
        contractBuyerAddress.textContent = buyerAddressInput.value || '.....................';
        contractBuyerId.textContent = buyerIdInput.value || '.....................';
        contractBuyerPhone.textContent = buyerPhoneInput.value || '.....................';
    
        // Car Data
        contractCarNumber.textContent = carNumberInput.value || '.....................';
        contractCarType.textContent = carTypeInput.value || '.....................';
        contractCarBrand.textContent = carBrandInput.value || '.....................';
        contractCarModel.textContent = carModelInput.value || '.....................';
        contractCarSize.textContent = carSizeInput.value || '.....................';
        contractCarColor.textContent = carColorInput.value || '.....................';
        contractChassisNumber.textContent = chassisNumberInput.value || '.....................';
    
        // Financial Data
        const price = parseFloat(priceInput.value) || 0;
        const deposit = parseFloat(depositInput.value) || 0;
        const remaining = price - deposit;
    
        contractPrice.textContent = price.toLocaleString('en-US'); 
        contractPriceText.textContent = convertNumberToArabicWords(price);
        contractDeposit.textContent = deposit.toLocaleString('en-US');
        contractRemainingAmount.textContent = remaining.toLocaleString('en-US');
    
        remainingAmountInput.value = remaining.toLocaleString('en-US');
    
        // Additional Notes
        contractAdditionalNotes.textContent = additionalNotesInput.value || 'لا توجد ملاحظات إضافية.';
    
        // Signatures
        contractSellerSignature.textContent = sellerNameInput.value || '.....................';
        contractBuyerSignature.textContent = buyerNameInput.value || '.....................';
    }
    
    // Set today's date as default
    const today = new Date();
    const currentYear = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    contractDateInput.value = `${currentYear}-${mm}-${dd}`;
    
    // Initial update when page loads
    updateContract();
    
    // Event listener for update button
    if (updateContractBtn) {
        updateContractBtn.addEventListener('click', updateContract);
    } else {
        console.error('Button #updateContract not found!');
    }
    
    // Event listener for Print button
    if (printContractBtn) {
        printContractBtn.addEventListener('click', () => {
            window.print();
        });
    } else {
        console.error('Button #printContract not found!');
    }
    
    // Event listener for Reset Form button
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            document.querySelectorAll('.form-section input[type="text"], .form-section input[type="number"], .form-section input[type="tel"], .form-section input[type="date"], .form-section textarea').forEach(input => {
                input.value = '';
            });
            
            // Re-set default date to today's date after reset
            const today = new Date();
            const currentYear = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            contractDateInput.value = `${currentYear}-${mm}-${dd}`;
            
            updateContract();
        });
    } else {
        console.error('Button #resetForm not found!');
    }
    
    // Add event listeners for input changes to update contract dynamically
    document.querySelectorAll('.form-section input, .form-section select, .form-section textarea').forEach(input => {
        input.addEventListener('input', updateContract);
        input.addEventListener('change', updateContract);
    });
});