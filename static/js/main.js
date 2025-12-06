// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let compareList = JSON.parse(localStorage.getItem('compareList')) || [];
let allUniversities = [];

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    updateComparePanel();
    loadCompareFromStorage();
    initHeroSearch();
    initScrollAnimations();
    initCounterAnimations();
});

// ===== АНИМАЦИИ ПРИ СКРОЛЛЕ =====
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
}

// ===== АНИМАЦИЯ СЧЁТЧИКОВ =====
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number[data-count]');

    if (!counters.length) return;

    // Сразу показываем начальное значение и запускаем анимацию
    counters.forEach(counter => {
        counter.textContent = '0+';
        // Небольшая задержка чтобы DOM обновился
        setTimeout(() => animateCounter(counter), 50);
    });
}

function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    if (!target) return;

    const duration = 1500; // Ускорил анимацию
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * target);

        element.textContent = current + '+';

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target + '+';
        }
    }

    requestAnimationFrame(update);
}

// ===== ПОИСК В HERO С АВТОДОПОЛНЕНИЕМ =====
function initHeroSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    // Получаем данные университетов из карточек
    const cards = document.querySelectorAll('.university-card');
    cards.forEach(card => {
        allUniversities.push({
            id: card.querySelector('a[href^="/university/"]')?.href.split('/').pop(),
            name: card.dataset.name,
            city: card.dataset.city,
            element: card
        });
    });

    // Создаём dropdown для подсказок
    const searchWrapper = searchInput.closest('.hero-search');
    if (searchWrapper) {
        const dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        dropdown.id = 'searchDropdown';
        searchWrapper.appendChild(dropdown);
    }

    // Обработчик ввода
    searchInput.addEventListener('input', handleHeroSearch);
    searchInput.addEventListener('focus', handleHeroSearch);

    // Закрытие dropdown при клике вне
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.hero-search')) {
            const dropdown = document.getElementById('searchDropdown');
            if (dropdown) dropdown.style.display = 'none';
        }
    });
}

function handleHeroSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const dropdown = document.getElementById('searchDropdown');
    if (!dropdown) return;

    if (query.length < 1) {
        dropdown.style.display = 'none';
        filterUniversities();
        return;
    }

    // Фильтруем университеты
    const matches = allUniversities.filter(uni =>
        uni.name.includes(query) || uni.city.toLowerCase().includes(query)
    ).slice(0, 6);

    if (matches.length > 0) {
        dropdown.innerHTML = matches.map(uni => {
            const uniId = uni.element.querySelector('a[href^="/university/"]')?.href.split('/').pop() || '1';
            return `<div class="search-item" onclick="goToUniversity(${uniId})">
                <i class="fas fa-university"></i>
                <div>
                    <span class="search-item-name">${highlightMatch(uni.name, query)}</span>
                    <span class="search-item-city">${uni.city}</span>
                </div>
            </div>`;
        }).join('');
        dropdown.style.display = 'block';
    } else {
        dropdown.innerHTML = '<div class="search-item no-results"><i class="fas fa-search"></i> Ничего не найдено</div>';
        dropdown.style.display = 'block';
    }

    // Также фильтруем карточки
    filterUniversities();
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function goToUniversity(id) {
    window.location.href = `/university/${id}`;
}

// ===== МОБИЛЬНОЕ МЕНЮ =====
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

// ===== ФИЛЬТРАЦИЯ УНИВЕРСИТЕТОВ =====
function filterUniversities() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const cityFilter = document.getElementById('filterCity')?.value || '';
    const focusFilter = document.getElementById('filterFocus')?.value || '';
    const sortBy = document.getElementById('sortBy')?.value || 'rating';

    const cards = document.querySelectorAll('.university-card');
    let visibleCards = [];

    cards.forEach(card => {
        const name = card.dataset.name || '';
        const city = card.dataset.city || '';
        const focus = card.dataset.focus || '';

        const matchSearch = name.includes(searchInput) || city.toLowerCase().includes(searchInput);
        const matchCity = !cityFilter || city === cityFilter;
        const matchFocus = !focusFilter || focus === focusFilter;

        if (matchSearch && matchCity && matchFocus) {
            card.style.display = 'block';
            visibleCards.push(card);
        } else {
            card.style.display = 'none';
        }
    });

    // Сортировка
    const grid = document.getElementById('universitiesGrid');
    if (grid && visibleCards.length > 0) {
        visibleCards.sort((a, b) => {
            switch(sortBy) {
                case 'rating':
                    return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
                case 'price_low':
                    return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                case 'price_high':
                    return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                case 'ent':
                    return parseFloat(a.dataset.ent) - parseFloat(b.dataset.ent);
                default:
                    return 0;
            }
        });

        visibleCards.forEach(card => grid.appendChild(card));
    }
}

// ===== СРАВНЕНИЕ УНИВЕРСИТЕТОВ =====
function addToCompare(id, name) {
    const maxCompare = 4;

    // Проверяем, не добавлен ли уже
    const exists = compareList.find(item => item.id === id);
    if (exists) {
        removeFromCompare(id);
        return;
    }

    // Максимум 4 университета
    if (compareList.length >= maxCompare) {
        alert(`Максимум ${maxCompare} университета для сравнения`);
        return;
    }

    compareList.push({ id, name });
    saveCompareToStorage();
    updateComparePanel();
}

function removeFromCompare(id) {
    compareList = compareList.filter(item => item.id !== id);
    saveCompareToStorage();
    updateComparePanel();
}

function clearCompare() {
    compareList = [];
    saveCompareToStorage();
    updateComparePanel();
}

function saveCompareToStorage() {
    localStorage.setItem('compareList', JSON.stringify(compareList));
}

function loadCompareFromStorage() {
    compareList = JSON.parse(localStorage.getItem('compareList')) || [];
    updateComparePanel();
}

function updateComparePanel() {
    const panel = document.getElementById('comparePanel');
    const list = document.getElementById('compareList');
    const count = document.getElementById('compareCount');
    const goBtn = document.getElementById('goCompareBtn');

    if (!panel || !list || !count) return;

    count.textContent = compareList.length;

    if (compareList.length > 0) {
        panel.classList.add('active');
        list.innerHTML = compareList.map(item => `
            <div class="compare-item">
                <span>${item.name.substring(0, 30)}${item.name.length > 30 ? '...' : ''}</span>
                <button onclick="removeFromCompare(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    } else {
        panel.classList.remove('active');
    }

    // Обновляем кнопки сравнения на карточках
    document.querySelectorAll('.university-card .btn-outline').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick) {
            const match = onclick.match(/addToCompare\((\d+)/);
            if (match) {
                const id = parseInt(match[1]);
                const inList = compareList.find(item => item.id === id);
                if (inList) {
                    btn.innerHTML = '<i class="fas fa-check"></i> Добавлено';
                    btn.style.borderColor = '#10b981';
                    btn.style.color = '#10b981';
                } else {
                    btn.innerHTML = '<i class="fas fa-plus"></i> Сравнить';
                    btn.style.borderColor = '';
                    btn.style.color = '';
                }
            }
        }
    });
}

// ===== AI ЧАТБОТ =====
let chatbotOpen = false;

function toggleChatbot() {
    const modal = document.getElementById('chatModal');
    const fab = document.getElementById('chatFab');

    chatbotOpen = !chatbotOpen;

    if (chatbotOpen) {
        modal.classList.add('active');
        document.getElementById('chatInput')?.focus();
    } else {
        modal.classList.remove('active');
    }
}

function quickQuestion(question) {
    document.getElementById('chatInput').value = question;
    sendMessage();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const messagesContainer = document.getElementById('chatMessages');
    const sendBtn = document.getElementById('sendBtn');

    const message = input.value.trim();
    if (!message) return;

    // Добавляем сообщение пользователя
    addMessage(message, 'user');
    input.value = '';

    // Показываем индикатор загрузки
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';

    // Добавляем индикатор печатания
    const typingId = 'typing-' + Date.now();
    messagesContainer.innerHTML += `
        <div class="chat-message bot" id="${typingId}">
            <div class="chat-message-avatar"><i class="fas fa-brain"></i></div>
            <div class="chat-message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    scrollToBottom();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();

        // Убираем индикатор печатания
        document.getElementById(typingId)?.remove();

        // Добавляем ответ бота
        addMessage(data.response, 'bot');

    } catch (error) {
        document.getElementById(typingId)?.remove();
        addMessage('Извините, произошла ошибка. Попробуйте позже.', 'bot');
    }

    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
}

function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');

    // Форматируем текст (поддержка markdown-like)
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    const icon = sender === 'bot' ? '<i class="fas fa-brain"></i>' : '<i class="fas fa-user"></i>';

    const messageHTML = `
        <div class="chat-message ${sender}">
            <div class="chat-message-avatar">${icon}</div>
            <div class="chat-message-content">
                <p>${formattedText}</p>
            </div>
        </div>
    `;

    messagesContainer.innerHTML += messageHTML;
    scrollToBottom();
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// ===== FAQ ACCORDION =====
function toggleFaq(element) {
    const faqItem = element.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');

    // Закрываем все
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });

    // Открываем текущий, если был закрыт
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// ===== COMPARE PAGE FUNCTIONS =====
function toggleUniversitySelect(id, name, element) {
    const exists = compareList.find(item => item.id === id);

    if (exists) {
        removeFromCompare(id);
        element.classList.remove('selected');
    } else {
        if (compareList.length >= 4) {
            alert('Максимум 4 университета для сравнения');
            return;
        }
        compareList.push({ id, name });
        saveCompareToStorage();
        element.classList.add('selected');
    }

    updateSelectedCount();
    updateCompareTable();

    // Обновляем плавающую кнопку
    if (typeof updateFloatingButton === 'function') {
        updateFloatingButton();
    }
}

function updateSelectedCount() {
    const countEl = document.getElementById('selectedCount');
    if (countEl) {
        countEl.textContent = compareList.length;
    }
}

function clearAllSelection() {
    compareList = [];
    saveCompareToStorage();
    document.querySelectorAll('.selector-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    updateSelectedCount();
    updateCompareTable();

    // Обновляем плавающую кнопку
    if (typeof updateFloatingButton === 'function') {
        updateFloatingButton();
    }
}

async function updateCompareTable() {
    const container = document.getElementById('compareTableContainer');
    if (!container) return;

    if (compareList.length < 2) {
        container.innerHTML = `
            <div class="compare-empty-state">
                <div class="empty-icon">
                    <i class="fas fa-balance-scale"></i>
                </div>
                <h3>Выберите университеты для сравнения</h3>
                <p>Нажмите на карточки университетов выше, чтобы добавить их к сравнению (минимум 2)</p>
            </div>
        `;
        return;
    }

    // Показываем загрузку
    container.innerHTML = `
        <div class="compare-empty-state">
            <div class="loading-spinner"></div>
            <p style="margin-top: 20px;">Загрузка данных...</p>
        </div>
    `;

    try {
        const ids = compareList.map(item => item.id);
        const response = await fetch('/api/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ university_ids: ids })
        });

        const data = await response.json();
        renderCompareTable(data.universities);

    } catch (error) {
        console.error('Error loading comparison:', error);
        container.innerHTML = `
            <div class="compare-empty-state">
                <div class="empty-icon" style="background: rgba(239, 68, 68, 0.1);">
                    <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                </div>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить данные. Попробуйте обновить страницу.</p>
            </div>
        `;
    }
}

function renderCompareTable(universities) {
    const container = document.getElementById('compareTableContainer');
    if (!container || !universities || universities.length === 0) return;

    const colCount = universities.length + 1;

    // Функции форматирования
    const formatPrice = (v) => v === 0 ? '<span class="compare-badge badge-success">Бесплатно (грант)</span>' : `<span class="compare-value">${v?.toLocaleString() || 'н/д'} ₸</span>`;
    const formatBool = (v) => v ? '<span class="compare-yes">✓ Есть</span>' : '<span class="compare-no">✗ Нет</span>';
    const formatRating = (v) => `<span class="compare-value">${v}</span> / 5.0`;
    const formatIelts = (u) => {
        if (!u.ielts_required) return '<span class="compare-no">Не требуется</span>';
        return `<span class="compare-badge badge-info">IELTS ${u.ielts_min_score || '6.0'}+</span>`;
    };
    const formatLangs = (langs) => {
        if (!langs || !langs.length) return 'н/д';
        return langs.map(l => `<span class="compare-badge badge-info">${l}</span>`).join(' ');
    };

    const sections = [
        {
            title: 'Основная информация',
            rows: [
                { label: 'Город', getValue: u => u.city },
                { label: 'Направление', getValue: u => `<span class="compare-badge badge-warning">${u.focus}</span>` },
                { label: 'Рейтинг', getValue: u => formatRating(u.rating) },
                { label: 'Год основания', getValue: u => u.founded_year || 'н/д' },
                { label: 'Аккредитация', getValue: u => u.accreditation || 'н/д' },
            ]
        },
        {
            title: 'Стоимость обучения',
            rows: [
                { label: 'Бакалавриат (год)', getValue: u => formatPrice(u.tuition_kzt_year) },
                { label: 'Магистратура (год)', getValue: u => formatPrice(u.tuition_master_kzt_year) },
                { label: 'Стипендии/Гранты', getValue: u => u.scholarships || 'н/д' },
            ]
        },
        {
            title: 'Требования к поступлению',
            rows: [
                { label: 'Мин. балл ЕНТ', getValue: u => `<span class="compare-value">${u.ent_min_score || 'н/д'}</span>` },
                { label: 'Балл ЕНТ для гранта', getValue: u => u.grant_ent_score ? `<span class="compare-value">${u.grant_ent_score}+</span>` : 'н/д' },
                { label: 'Требуется IELTS', getValue: formatIelts },
                { label: 'Языки обучения', getValue: u => formatLangs(u.language_of_instruction) },
                { label: 'Дедлайн поступления', getValue: u => u.admission_deadline_month || 'н/д' },
            ]
        },
        {
            title: 'Инфраструктура и возможности',
            rows: [
                { label: 'Общежитие', getValue: u => formatBool(u.dormitory) },
                { label: 'Военная кафедра', getValue: u => formatBool(u.military_department) },
                { label: 'Международный обмен', getValue: u => formatBool(u.international_exchange) },
                { label: 'Партнёры', getValue: u => u.partner_universities || 'н/д' },
                { label: '3D-тур', getValue: u => u.tour_url ? '<span class="compare-yes">✓ Доступен</span>' : '<span class="compare-no">✗ Нет</span>' },
            ]
        },
    ];

    let tableHTML = `
        <div class="compare-table-wrapper">
            <table class="compare-table">
                <thead>
                    <tr>
                        <th>Параметр</th>
                        ${universities.map(u => `<th>${u.name_ru}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;

    sections.forEach(section => {
        tableHTML += `
            <tr class="compare-section-divider">
                <td colspan="${colCount}">${section.title}</td>
            </tr>
        `;
        section.rows.forEach(row => {
            tableHTML += `
                <tr>
                    <td>${row.label}</td>
                    ${universities.map(u => `<td>${row.getValue(u)}</td>`).join('')}
                </tr>
            `;
        });
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHTML;
}

// Инициализация страницы сравнения
function initComparePage() {
    // Отмечаем уже выбранные университеты
    compareList.forEach(item => {
        const card = document.querySelector(`.selector-card[data-id="${item.id}"]`);
        if (card) {
            card.classList.add('selected');
        }
    });

    updateCompareTable();
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

