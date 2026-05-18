const formatToWords = num => {
    if (num >= 10000000) { // Crore
        const value = Math.ceil((num / 10000000) * 100) / 100;
        return `₹${value.toFixed(2)} Crore`;
    } else if (num >= 100000) { // Lakh
        const value = Math.ceil((num / 100000) * 100) / 100;
        return `₹${value.toFixed(2)} Lakh`;
    } else {
        let integer = Math.ceil(num).toString();
        if (integer.length > 3) {
            let lastThree = integer.slice(-3);
            let otherNumbers = integer.slice(0, -3);
            otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
            integer = otherNumbers + "," + lastThree;
        }
        return "₹" + integer;
    }
};

function formatNumber(input) {
    input.classList.remove('error');
    let value = input.value.replace(/,/g, '');
    value = value.replace(/[^0-9.]/g, ''); 
    if (value.length > 3) {
        let parts = value.split('.');
        let integer = parts[0];
        let decimal = parts.length > 1 ? '.' + parts[1] : '';
        let lastThree = integer.slice(-3);
        let otherNumbers = integer.slice(0, -3);
        if (otherNumbers) {
            otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
            integer = otherNumbers + "," + lastThree;
        }
        value = integer + decimal;
    }
    input.value = value;
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() { 
        formatNumber(this); 
    });
});

function calculateSWP() {
    const errorDiv = document.getElementById('error-message');
    const resultsDiv = document.getElementById('results');
    const requiredFields = ['totalInvestment', 'monthlyWithdrawal', 'rate', 'years'];
    let isValid = true;

    requiredFields.forEach(id => {
        const element = document.getElementById(id);
        if (element.value.trim() === "") {
            element.classList.add('error');
            isValid = false;
        } else {
            element.classList.remove('error');
        }
    });

    if (!isValid) return;

    errorDiv.style.display = 'none';

    const getVal = id => parseFloat(document.getElementById(id).value.replace(/,/g, '')) || 0;
    const principal = getVal('totalInvestment');
    const withdrawal = getVal('monthlyWithdrawal');
    const annualRate = getVal('rate');
    const years = getVal('years');

    if (years > 100) {
        errorDiv.innerText = "Please enter Time Period between 1 and 100";
        errorDiv.style.display = 'block';
        resultsDiv.style.display = 'none';
        return;
    }

    if (withdrawal > principal) {
        errorDiv.innerText = "Monthly Withdrawal cannot be more than the Investment Value";
        errorDiv.style.display = 'block';
        resultsDiv.style.display = 'none';
        return;
    }
    
    if (annualRate < 1 || annualRate > 12) {
        errorDiv.innerText = "Please enter Expected Returns between 1 and 12";
        errorDiv.style.display = 'block';
        resultsDiv.style.display = 'none';
        return;
    }

    const i = (annualRate / 100) / 12; 
    const n = years * 12;               
    let balance = principal;
    let totalWithdrawn = 0;
    let depletionMonth = n;
    let isDepleted = false;

    for (let m = 0; m < n; m++) {
        if (balance >= withdrawal) {
            balance -= withdrawal;
            totalWithdrawn += withdrawal;
            balance *= (1 + i); 
        } else {
            totalWithdrawn += balance;
            balance = 0;
            depletionMonth = m; // The month the money ran out
            isDepleted = true;
            break;
        }
    }

    // Display Main Results
    document.getElementById('displayInvested').innerText = formatToWords(principal);
    document.getElementById('displayWithdrawn').innerText = formatToWords(totalWithdrawn);
    document.getElementById('displayFinalValue').innerText = formatToWords(balance);

    // Handling the Summary Sentences
    const depletionDiv = document.getElementById('depletionMessage');
    if (isDepleted) {
        const dYears = Math.floor(depletionMonth / 12);
        const dMonths = depletionMonth % 12;
        
        // Reverse calculation: How much could they withdraw to hit 0 exactly at 'n' months?
        // PMT = (PV * i) / ((1 - (1+i)^-n) * (1+i))
        const sustainableWithdrawal = (principal * i) / ((1 - Math.pow(1 + i, -n)) * (1 + i));

        document.getElementById('depleteTime').innerText = `${dYears} years and ${dMonths} months`;
        document.getElementById('currentWithdrawal').innerText = formatToWords(withdrawal);
        document.getElementById('targetYears').innerText = years;
        document.getElementById('suggestedWithdrawal').innerText = formatToWords(sustainableWithdrawal);
        
        depletionDiv.style.display = 'block';
    } else {
        depletionDiv.style.display = 'none';
    }

    document.getElementById('results').style.display = 'block';
}