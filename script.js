// Konstanter
const G_VALUE = 744168; // Grunnbeløp (6G = 744 168 kr)

// DOM-elementer
document.addEventListener('DOMContentLoaded', function() {
    // Hent input-elementer
    const incomeInput = document.getElementById('income');
    const ageInput = document.getElementById('age');
    const employmentPercentageInput = document.getElementById('employment-percentage');
    const calculateBtn = document.getElementById('calculate-btn');

    // Hent resultat-elementer
    const currentMonthlyIncomeElement = document.getElementById('current-monthly-income');
    const navSicknessPaymentElement = document.getElementById('nav-sickness-payment');
    const navDisabilityPaymentElement = document.getElementById('nav-disability-payment');
    const incomeGapElement = document.getElementById('income-gap');
    
    // Hent graf-elementer
    const currentIncomeBarElement = document.getElementById('current-income-bar');
    const navSicknessBarElement = document.getElementById('nav-sickness-bar');
    const navDisabilityBarElement = document.getElementById('nav-disability-bar');
    const gapSicknessBarElement = document.getElementById('gap-sickness-bar');
    const gapDisabilityBarElement = document.getElementById('gap-disability-bar');
    const currentIncomeValueElement = document.getElementById('current-income-value');
    const sicknessValueElement = document.getElementById('sickness-value');
    const disabilityValueElement = document.getElementById('disability-value');

    // Hent anbefalinger-container
    const recommendationsContainer = document.getElementById('recommendations-container');

    // Legg til event listener for beregningsknappen
    calculateBtn.addEventListener('click', generateRecommendations);

    // Generer anbefalinger basert på input
    function generateRecommendations() {
        // Hent verdier fra input-feltene
        const income = parseFloat(incomeInput.value) || 0;
        const age = parseInt(ageInput.value) || 0;
        const employmentPercentage = parseInt(employmentPercentageInput.value) || 0;

        // Beregn månedlig inntekt
        const monthlyIncome = income / 12;
        
        // Vis nåværende månedsinntekt
        currentMonthlyIncomeElement.textContent = formatCurrency(monthlyIncome);
        currentIncomeValueElement.textContent = formatCurrency(monthlyIncome);

        // Beregn NAV-ytelser
        // Sykepenger (100% av inntekt opp til 6G)
        const navSicknessPayment = Math.min(monthlyIncome, G_VALUE / 12) * (employmentPercentage / 100);
        navSicknessPaymentElement.textContent = formatCurrency(navSicknessPayment);
        sicknessValueElement.textContent = formatCurrency(navSicknessPayment);

        // Uføretrygd (66% av inntekt opp til 6G)
        const navDisabilityPayment = Math.min(monthlyIncome, G_VALUE / 12) * 0.66 * (employmentPercentage / 100);
        navDisabilityPaymentElement.textContent = formatCurrency(navDisabilityPayment);
        disabilityValueElement.textContent = formatCurrency(navDisabilityPayment);

        // Beregn inntektstap
        const sicknessTap = Math.max(0, monthlyIncome - navSicknessPayment);
        const disabilityTap = Math.max(0, monthlyIncome - navDisabilityPayment);
        const maxTap = Math.max(sicknessTap, disabilityTap);
        incomeGapElement.textContent = formatCurrency(maxTap);

        // Oppdater grafen
        updateChart(monthlyIncome, navSicknessPayment, navDisabilityPayment, sicknessTap, disabilityTap);

        // Generer anbefalinger
        const recommendations = [];

        // Sykelønnsforsikring
        if (income > G_VALUE) {
            recommendations.push({
                title: "Sykelønnsforsikring",
                description: "Dekker inntektstap mellom NAV-ytelser og lønn over 6G ved sykdom.",
                reason: "Din inntekt er over 6G (744 168 kr), så NAV dekker ikke hele inntekten din ved sykdom.",
                priority: "high"
            });
        }

        // Uførepensjon
        if (income > 300000) {
            const priority = income > G_VALUE ? "high" : "medium";
            recommendations.push({
                title: "Uførepensjon",
                description: "Gir månedlige utbetalinger ved varig uførhet som supplement til NAVs uføretrygd.",
                reason: "NAVs uføretrygd dekker kun 66% av inntekt opp til 6G, noe som gir et betydelig inntektstap.",
                priority: priority
            });
        }

        // Alvorlig sykdom
        if (age >= 40 || income > 500000) {
            const priority = age >= 50 ? "high" : "medium";
            recommendations.push({
                title: "Alvorlig sykdom",
                description: "Gir en engangsutbetaling ved diagnoser som kreft, hjerteinfarkt eller hjerneslag.",
                reason: age >= 40 ? "Risikoen for alvorlige sykdommer øker med alderen." : "Gir økonomisk trygghet ved alvorlig sykdom uavhengig av arbeidsevne.",
                priority: priority
            });
        }

        // Annen sykdom
        if (age < 40 && income > 400000) {
            recommendations.push({
                title: "Annen sykdom",
                description: "Gir en engangsutbetaling ved arbeidsuførhet på grunn av sykdom.",
                reason: "Gir økonomisk buffer i en periode med inntektstap på grunn av sykdom.",
                priority: "medium"
            });
        }

        // Syk (antall utbetalinger)
        if (income > 500000 || (age >= 45 && income > 400000)) {
            recommendations.push({
                title: "Syk (flere utbetalinger)",
                description: "Gir valgfritt antall utbetalinger (1-4) ved arbeidsuførhet uansett årsak.",
                reason: "Gir fleksibilitet i utbetalinger og dekker flere situasjoner enn standard uføreforsikringer.",
                priority: "low"
            });
        }

        // Hvis ingen anbefalinger, legg til en generell anbefaling
        if (recommendations.length === 0) {
            recommendations.push({
                title: "Grunnleggende inntektssikring",
                description: "Vurder en enkel uføreforsikring for å sikre inntekt ved langvarig sykdom.",
                reason: "Selv med lav inntekt kan det være klokt å ha en grunnleggende sikring utover NAVs ytelser.",
                priority: "low"
            });
        }

        // Vis anbefalinger
        displayRecommendations(recommendations);
    }

    // Vis anbefalinger i UI
    function displayRecommendations(recommendations) {
        // Tøm container
        recommendationsContainer.innerHTML = '';

        // Sorter anbefalinger etter prioritet
        recommendations.sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        // Legg til anbefalinger
        recommendations.forEach(rec => {
            const recElement = document.createElement('div');
            recElement.className = `recommendation-item priority-${rec.priority}`;
            
            recElement.innerHTML = `
                <div class="recommendation-title">${rec.title}</div>
                <div class="recommendation-description">${rec.description}</div>
                <div class="recommendation-reason">Hvorfor: ${rec.reason}</div>
            `;
            
            recommendationsContainer.appendChild(recElement);
        });
    }

    // Oppdater grafen basert på beregninger
    function updateChart(monthlyIncome, navSicknessPayment, navDisabilityPayment, sicknessTap, disabilityTap) {
        const maxValue = monthlyIncome;
        
        // Sett høyde på søylene relativt til maksverdi
        currentIncomeBarElement.style.height = (monthlyIncome / maxValue * 100) + '%';
        
        navSicknessBarElement.style.height = (navSicknessPayment / maxValue * 100) + '%';
        gapSicknessBarElement.style.height = (sicknessTap / maxValue * 100) + '%';
        
        navDisabilityBarElement.style.height = (navDisabilityPayment / maxValue * 100) + '%';
        gapDisabilityBarElement.style.height = (disabilityTap / maxValue * 100) + '%';
    }

    // Formater valuta
    function formatCurrency(amount) {
        return Math.round(amount).toLocaleString('nb-NO') + ' kr';
    }

    // Kjør beregning ved oppstart for å vise standardverdier
    generateRecommendations();
});
