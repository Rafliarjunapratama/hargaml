document.addEventListener('DOMContentLoaded', function () {

    // --- Elemen DOM Utama ---
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultPrice = document.getElementById('resultPrice');
    const priceBreakdown = document.getElementById('priceBreakdown');
    const winRateInput = document.getElementById('winRate');
    const winRateProgressBar = document.getElementById('winRateProgressBar');
    const totalRankMatchesInput = document.getElementById('totalRankMatches');
    const emblemLevel60Input = document.getElementById('emblemLevel60');
    const emblemCountSpan = document.getElementById('emblemCount');
    const resultSection = document.querySelector('.result-section');
    const visitorCountSpan = document.getElementById('visitorCount');

    // --- Konfigurasi Input Skin ---
    const skinInputIds = [
        'skinSupreme', 'skinGrand', 'skinExquisite', 'skinDeluxe',
        'skinExceptional', 'skinCommon', 'skinPainted'
    ];

    // --- Visitor Counter Statis (tanpa database) ---
    if (visitorCountSpan) {
        visitorCountSpan.textContent = '59.145 Player';
    }

    // Catatan: feedbackForm & database sudah dihapus di versi ini.

    // --- Fungsi Helper Umum ---
    function formatToIDR(amount) {
        return 'Rp ' + amount.toLocaleString('id-ID');
    }

    function showError(elementId, message) {
        const errorDiv = document.getElementById(elementId + '-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        }
    }

    function clearError(elementId) {
        const errorDiv = document.getElementById(elementId + '-error');
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.classList.remove('show');
        }
    }

    // --- Validasi Input Form Utama ---
    function validateInputs() {
        let isValid = true;

        const winRate = parseFloat(winRateInput.value);
        if (isNaN(winRate) || winRate < 0 || winRate > 100) {
            showError('winRate', 'Win Rate harus antara 0-100%.');
            isValid = false;
        } else {
            clearError('winRate');
        }

        const totalHeroesInput = document.getElementById('totalHeroes');
        const totalHeroes = parseInt(totalHeroesInput.value);
        if (isNaN(totalHeroes) || totalHeroes < 0) {
            showError('totalHeroes', 'Jumlah Hero harus angka positif.');
            isValid = false;
        } else {
            clearError('totalHeroes');
        }

        const totalRankMatches = parseInt(totalRankMatchesInput.value);
        if (isNaN(totalRankMatches) || totalRankMatches < 0) {
            showError('totalRankMatches', 'Total Ranked Matches harus angka positif.');
            isValid = false;
        } else {
            clearError('totalRankMatches');
        }

        const emblemLevel60 = parseInt(emblemLevel60Input.value);
        if (isNaN(emblemLevel60) || emblemLevel60 < 0 || emblemLevel60 > 7) {
            showError('emblemLevel60', 'Jumlah Emblem Level 60 harus antara 0-7.');
            isValid = false;
        } else {
            clearError('emblemLevel60');
        }

        skinInputIds.forEach(id => {
            const inputElement = document.getElementById(id);
            const value = parseInt(inputElement.value);
            if (isNaN(value) && inputElement.value !== '') {
                showError(id, 'Masukkan angka yang valid.');
                isValid = false;
            } else if (value < 0) {
                showError(id, 'Angka tidak boleh negatif.');
                isValid = false;
            } else {
                clearError(id);
            }
        });

        return isValid;
    }

    // --- Fungsi Perhitungan Harga Akun ---
    calculateBtn.addEventListener('click', function () {
        if (!validateInputs()) {
            resultPrice.textContent = 'Rp 0';
            priceBreakdown.innerHTML = '';
            return;
        }

        let totalPrice = 0;
        let breakdown = {};

        // 1. Harga Dasar Akun
        const basePrice = 10000;
        totalPrice += basePrice;
        breakdown['Harga Dasar Akun'] = basePrice;

        // 2. Ambil Input dari Formulir
        const tier = document.getElementById('tier').value;
        const winRate = parseFloat(winRateInput.value) || 0;
        const totalRankMatches = parseInt(totalRankMatchesInput.value) || 0;
        const emblemLevel60 = parseInt(emblemLevel60Input.value) || 0;

        const skinSupreme    = parseInt(document.getElementById('skinSupreme').value)    || 0;
        const skinGrand      = parseInt(document.getElementById('skinGrand').value)      || 0;
        const skinExquisite  = parseInt(document.getElementById('skinExquisite').value)  || 0;
        const skinDeluxe     = parseInt(document.getElementById('skinDeluxe').value)     || 0;
        const skinExceptional= parseInt(document.getElementById('skinExceptional').value)|| 0;
        const skinCommon     = parseInt(document.getElementById('skinCommon').value)     || 0;
        const paintedSkin    = parseInt(document.getElementById('skinPainted').value)    || 0;

        // 3. Perhitungan Skin
        const skinPoinValues = {
            Supreme: 4000, Grand: 3000, Exquisite: 2000, Deluxe: 400,
            Exceptional: 200, Common: 10, Painted: 40
        };
        const pricePerSkinPoint = 25;

        const skinMap = [
            ['Skin Supreme',    skinSupreme,     skinPoinValues.Supreme],
            ['Skin Grand',      skinGrand,       skinPoinValues.Grand],
            ['Skin Exquisite',  skinExquisite,   skinPoinValues.Exquisite],
            ['Skin Deluxe',     skinDeluxe,      skinPoinValues.Deluxe],
            ['Skin Exceptional',skinExceptional, skinPoinValues.Exceptional],
            ['Skin Common',     skinCommon,      skinPoinValues.Common],
            ['Painted Skin',    paintedSkin,     skinPoinValues.Painted],
        ];

        skinMap.forEach(([label, count, poin]) => {
            const contribution = count * poin * pricePerSkinPoint;
            if (contribution > 0) breakdown[label] = contribution;
            totalPrice += contribution;
        });

        // 4. Emblem
        const emblemContribution = emblemLevel60 * 25000;
        totalPrice += emblemContribution;
        breakdown['Emblem Level 60'] = emblemContribution;

        // 5. Tier
        const tierValues = {
            Warrior: 0, Elite: 0, Master: 0, Grandmaster: 0,
            Epic: 10000, Legend: 50000, Mythic: 150000,
            'Mythical Honor': 300000, 'Mythical Glory': 1000000,
            'Mythical Immortal': 2000000
        };
        const tierContribution = tierValues[tier] || 0;
        totalPrice += tierContribution;
        breakdown['Tier Saat Ini'] = tierContribution;

        // 6. Win Rate + Match Multiplier
        let winRateBaseValue = 0;
        if (winRate >= 75)      winRateBaseValue = 2000000;
        else if (winRate >= 70) winRateBaseValue = 800000;
        else if (winRate >= 65) winRateBaseValue = 300000;
        else if (winRate >= 60) winRateBaseValue = 100000;

        let matchMultiplier = 0;
        if (totalRankMatches >= 2000)      matchMultiplier = 1;
        else if (totalRankMatches >= 1000) matchMultiplier = 0.5;

        const winRateContribution = winRateBaseValue * matchMultiplier;
        totalPrice += winRateContribution;
        breakdown['Win Rate Rank'] = winRateContribution;

        if (winRateBaseValue > 0 && matchMultiplier === 0) {
            breakdown['Catatan WR'] = 'WR tidak dihitung karena match < 1000';
        } else if (winRateBaseValue > 0 && matchMultiplier === 0.5) {
            breakdown['Catatan WR'] = 'WR dihitung 50% karena match 1000–1999';
        }

        if (totalPrice < 0) totalPrice = 0;

        // --- 7. Tampilkan Hasil ---
        resultPrice.textContent = formatToIDR(totalPrice);
        resultPrice.classList.remove('fade-in-result');
        void resultPrice.offsetWidth;
        resultPrice.classList.add('fade-in-result');

        const orderedKeys = [
            'Harga Dasar Akun',
            'Skin Supreme', 'Skin Grand', 'Skin Exquisite', 'Skin Deluxe',
            'Skin Exceptional', 'Skin Common', 'Painted Skin',
            'Emblem Level 60', 'Tier Saat Ini', 'Win Rate Rank', 'Catatan WR'
        ];

        let breakdownHTML = '';
        orderedKeys.forEach(key => {
            if (breakdown[key] !== undefined &&
                (breakdown[key] > 0 || key === 'Harga Dasar Akun' || key === 'Catatan WR')) {
                breakdownHTML += `<p>
                    <span>${key}:</span>
                    <span>${key === 'Catatan WR' ? breakdown[key] : formatToIDR(breakdown[key])}</span>
                </p>`;
            }
        });
        priceBreakdown.innerHTML = breakdownHTML;

        if (resultSection) {
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // --- Reset Button ---
    resetBtn.addEventListener('click', function () {
        document.getElementById('tier').value = 'Warrior';
        winRateInput.value = '';
        totalRankMatchesInput.value = '';
        document.getElementById('totalHeroes').value = '';
        emblemLevel60Input.value = '';

        skinInputIds.forEach(id => {
            const el = document.getElementById(id);
            el.value = '';
            el.placeholder = '0';
        });

        ['winRate', 'totalRankMatches', 'totalHeroes', 'emblemLevel60', ...skinInputIds]
            .forEach(id => clearError(id));

        winRateProgressBar.style.width = '0%';
        emblemCountSpan.textContent = '0';
        resultPrice.textContent = 'Rp 0';
        priceBreakdown.innerHTML = '';
    });

    // --- Event Listeners Visual Form ---
    winRateInput.addEventListener('input', function () {
        const value = parseFloat(winRateInput.value);
        winRateProgressBar.style.width = (!isNaN(value) && value >= 0 && value <= 100)
            ? value + '%' : '0%';
        clearError('winRate');
    });

    emblemLevel60Input.addEventListener('input', function () {
        const value = parseInt(emblemLevel60Input.value);
        emblemCountSpan.textContent = (!isNaN(value) && value >= 0 && value <= 7) ? value : '0';
        clearError('emblemLevel60');
    });

    document.getElementById('totalHeroes').addEventListener('input', () => clearError('totalHeroes'));
    totalRankMatchesInput.addEventListener('input', () => clearError('totalRankMatches'));

    skinInputIds.forEach(id => {
        const el = document.getElementById(id);
        el.value = '';
        el.placeholder = '0';

        el.addEventListener('blur', () => {
            if (el.value === '' || isNaN(parseInt(el.value))) {
                el.value = '';
                el.placeholder = '0';
                clearError(id);
            } else if (parseInt(el.value) < 0) {
                el.value = 0;
                clearError(id);
            }
        });
        el.addEventListener('focus', () => { el.placeholder = ''; });
        el.addEventListener('input', () => clearError(id));
    });

    // Inisialisasi visual awal
    winRateInput.dispatchEvent(new Event('input'));
    emblemLevel60Input.dispatchEvent(new Event('input'));
});
