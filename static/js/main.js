// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let compareList = JSON.parse(localStorage.getItem('compareList')) || [];
let allUniversities = [];

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    updateComparePanel();
    loadCompareFromStorage();
    initHeroSearch();
});

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
    const window = document.getElementById('chatbotWindow');
    const trigger = document.getElementById('chatbotTrigger');

    chatbotOpen = !chatbotOpen;

    if (chatbotOpen) {
        window.classList.add('active');
        trigger.style.display = 'none';
        document.getElementById('chatInput')?.focus();
    } else {
        window.classList.remove('active');
        trigger.style.display = 'flex';
    }
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
    sendBtn.innerHTML = '<div class="loading"></div>';

    // Добавляем индикатор печатания
    const typingId = 'typing-' + Date.now();
    messagesContainer.innerHTML += `
        <div class="message bot" id="${typingId}">
            <div class="message-content">
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

    const messageHTML = `
        <div class="message ${sender}">
            <div class="message-content">
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

    updateCompareTable();
}

async function updateCompareTable() {
    if (compareList.length < 2) {
        document.getElementById('compareTableContainer').innerHTML = `
            <div class="info-card" style="text-align: center; padding: 60px;">
                <i class="fas fa-balance-scale" style="font-size: 3rem; color: var(--gray-light); margin-bottom: 20px;"></i>
                <p style="color: var(--gray);">Выберите минимум 2 университета для сравнения</p>
            </div>
        `;
        return;
    }

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
    }
}

function renderCompareTable(universities) {
    const container = document.getElementById('compareTableContainer');
    if (!container || !universities || universities.length === 0) return;

    const rows = [
        { label: 'Город', key: 'city' },
        { label: 'Направление', key: 'focus' },
        { label: 'Рейтинг', key: 'rating', format: v => `⭐ ${v}` },
        { label: 'Стоимость (бакалавр)', key: 'tuition_kzt_year', format: v => v === 0 ? 'Бесплатно (грант)' : `${v.toLocaleString()} ₸/год` },
        { label: 'Мин. балл ЕНТ', key: 'ent_min_score' },
        { label: 'Общежитие', key: 'dormitory', format: v => v ? '✅ Есть' : '❌ Нет' },
        { label: 'Военная кафедра', key: 'military_department', format: v => v ? '✅ Есть' : '❌ Нет' },
        { label: 'Обмен студентами', key: 'international_exchange', format: v => v ? '✅ Есть' : '❌ Нет' },
        { label: 'Дедлайн поступления', key: 'admission_deadline_month' },
    ];

    let tableHTML = `
        <table class="compare-table">
            <thead>
                <tr>
                    <th>Параметр</th>
                    ${universities.map(u => `<th>${u.name_ru}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${rows.map(row => `
                    <tr>
                        <td><strong>${row.label}</strong></td>
                        ${universities.map(u => {
                            const value = u[row.key];
                            const displayValue = row.format ? row.format(value) : value;
                            return `<td>${displayValue}</td>`;
                        }).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
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

