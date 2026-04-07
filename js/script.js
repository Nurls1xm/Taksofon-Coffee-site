// Shopping Cart System
let cart = JSON.parse(localStorage.getItem('coffeeCart')) || [];

function saveCart() {
    localStorage.setItem('coffeeCart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(item) {
    cart.push(item);
    saveCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
}

function updateCartItemQty(index, newQty) {
    if (newQty > 0 && newQty <= 10) {
        cart[index].quantity = newQty;
        saveCart();
    }
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.totalPrice * item.quantity), 0);
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartBody = document.getElementById('cartBody');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart body
    if (cart.length === 0) {
        cartBody.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p>${window.i18n.t('cart_empty')}</p>
                <span>${window.i18n.t('cart_empty_hint')}</span>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        const lang = localStorage.getItem('language') || 'kk';
        const mlText = window.i18n.t('unit_ml');
        
        cartBody.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${translateCartItemName(item.name)}</div>
                    <div class="cart-item-options">
                        ${item.size ? item.size + ' ' + mlText : ''}
                        ${item.options ? '<br>' + item.options : ''}
                        ${item.comment ? '<br><i class="fas fa-comment-dots"></i> <em>' + item.comment + '</em>' : ''}
                    </div>
                    <div class="cart-item-price">${item.totalPrice}₸ × ${item.quantity} = ${item.totalPrice * item.quantity}₸</div>
                </div>
                <div class="cart-item-actions">
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                    <div class="cart-item-qty">
                        <button class="cart-qty-btn" onclick="updateCartItemQty(${index}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="cart-qty-value">${item.quantity}</span>
                        <button class="cart-qty-btn" onclick="updateCartItemQty(${index}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        cartFooter.style.display = 'block';
        cartTotalPrice.textContent = getCartTotal() + '₸';
    }
}

let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
};

window.onscroll = () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
};

document.querySelectorAll('.image-slider img').forEach(images => {
    images.onclick = () => {
        var src = images.getAttribute('src');
        document.querySelector('.main-home-image').src = src;
    };
});

var swiper = new Swiper(".review-slider", {
    spaceBetween: 20,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    loop: false, // Отключен loop - нет дубликатов
    grabCursor: true,
    autoplay: {
        delay: 3000,  // 3 секунды (быстрее)
        disableOnInteraction: false,
    },
    breakpoints: {
        0: {
            slidesPerView: 1
        },
        768: {
            slidesPerView: 2
        }
    },
});

var menuSwiper = new Swiper(".menu-slider", {
    spaceBetween: 30,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    grabCursor: true,
    slidesPerView: 1,
});

var orderSwiper = new Swiper(".order-slider", {
    spaceBetween: 30,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    grabCursor: true,
    slidesPerView: 1,
});

// Category buttons functionality
const categoryButtons = document.querySelectorAll('.category-btn');

categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const categoryIndex = parseInt(btn.getAttribute('data-category'));
        
        // Update active button
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Slide to category
        orderSwiper.slideTo(categoryIndex);
    });
});

// Update active category button when slider changes
orderSwiper.on('slideChange', function () {
    const activeIndex = orderSwiper.activeIndex;
    categoryButtons.forEach(btn => {
        const categoryIndex = parseInt(btn.getAttribute('data-category'));
        if (categoryIndex === activeIndex) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    setTimeout(() => {
        initializeDrinkCards();
    }, 100);
});

// ===== COFFEE MODAL =====
const coffeeModal = document.getElementById('coffeeModal');
const closeModal = document.getElementById('closeModal');
const modalAddToCart = document.getElementById('modalAddToCart');
const modalCoffeeImage = document.getElementById('modalCoffeeImage');
const modalCoffeeName = document.getElementById('modalCoffeeName');
const modalCoffeeDesc = document.getElementById('modalCoffeeDesc');
const modalTotalPrice = document.getElementById('modalTotalPrice');

// Get translated drink name based on drink type
function getTranslatedDrinkName(drinkType) {
    // Map data-drink attributes to translation keys
    const drinkKeyMap = {
        // Coffee
        'latte': 'coffee_latte',
        'raf': 'coffee_raf',
        'flatwhite': 'coffee_flatwhite',
        'mocha': 'coffee_mocha',
        'americano': 'coffee_americano',
        'cappuccino': 'coffee_cappuccino',
        // Tea
        'seabuckthorn': 'tea_seabuckthorn',
        'berry': 'tea_berry',
        'morocco': 'tea_morocco',
        'ginger': 'tea_ginger',
        'gluhwein': 'tea_gluhwein',
        'karak': 'tea_karak',
        // Cold drinks
        'mojito': 'cold_watermelon_mojito',
        'iceamericano': 'cold_mango_passion',
        'frappe': 'cold_cherry_thyme',
        'lemonade': 'cold_vanilla_plombir',
        'smoothie': 'cold_chocolate_plombir',
        'milkshake': 'cold_banana_pudding',
        // Other drinks
        'cocoa': 'other_cocoa',
        'matcha': 'other_matcha_latte',
        'bumble': 'other_hot_chocolate',
        'rafalmond': 'other_matcha_sakura'
    };
    
    const key = drinkKeyMap[drinkType];
    const translated = key ? window.i18n.t(key) : drinkType;
    // Ensure first letter is capitalized (in case translation doesn't have it)
    return translated.charAt(0).toUpperCase() + translated.slice(1);
}

// Get translated drink description
function getTranslatedDrinkDesc(drinkType) {
    const drinkKeyMap = {
        // Coffee
        'latte': 'coffee_latte_desc',
        'raf': 'coffee_raf_desc',
        'flatwhite': 'coffee_flatwhite_desc',
        'mocha': 'coffee_mocha_desc',
        'americano': 'coffee_americano_desc',
        'cappuccino': 'coffee_cappuccino_desc',
        // Tea
        'seabuckthorn': 'tea_seabuckthorn_desc',
        'berry': 'tea_berry_desc',
        'morocco': 'tea_morocco_desc',
        'ginger': 'tea_ginger_desc',
        'gluhwein': 'tea_gluhwein_desc',
        'karak': 'tea_karak_desc',
        // Cold drinks
        'mojito': 'cold_watermelon_mojito_desc',
        'iceamericano': 'cold_mango_passion_desc',
        'frappe': 'cold_cherry_thyme_desc',
        'lemonade': 'cold_vanilla_plombir_desc',
        'smoothie': 'cold_chocolate_plombir_desc',
        'milkshake': 'cold_banana_pudding_desc',
        // Other drinks
        'cocoa': 'other_cocoa_desc',
        'matcha': 'other_matcha_latte_desc',
        'bumble': 'other_hot_chocolate_desc',
        'rafalmond': 'other_matcha_sakura_desc'
    };
    
    const key = drinkKeyMap[drinkType];
    return key ? window.i18n.t(key) : '';
}

// Try to translate cart item name by matching against known drinks
function translateCartItemName(itemName) {
    // Create reverse mapping from Kazakh names to translation keys
    const nameToKey = {
        // Coffee (Kazakh names)
        'Латте': 'coffee_latte',
        'Раф': 'coffee_raf',
        'Флэт уайт': 'coffee_flatwhite',
        'Моккачино': 'coffee_mocha',
        'Американо': 'coffee_americano',
        'Каппучино': 'coffee_cappuccino',
        // Coffee (English names)
        'Latte': 'coffee_latte',
        'Raf': 'coffee_raf',
        'Flat White': 'coffee_flatwhite',
        'Mocha': 'coffee_mocha',
        'Americano': 'coffee_americano',
        'Cappuccino': 'coffee_cappuccino',
        // Tea (Kazakh names)
        'Облепихалы шай': 'tea_seabuckthorn',
        'Жидекті шай': 'tea_berry',
        'Марокко шайы': 'tea_morocco',
        'Имбирлі шай': 'tea_ginger',
        'Глинтвейн шай': 'tea_gluhwein',
        'Карак шай': 'tea_karak',
        // Tea (English names)
        'Sea Buckthorn Tea': 'tea_seabuckthorn',
        'Berry Tea': 'tea_berry',
        'Moroccan Tea': 'tea_morocco',
        'Ginger Tea': 'tea_ginger',
        'Gluhwein Tea': 'tea_gluhwein',
        'Karak Tea': 'tea_karak',
        // Cold drinks (Kazakh names)
        'Лимонад Қарбыз-Мохито': 'cold_watermelon_mojito',
        'Лимонад Манго-Маракуйя': 'cold_mango_passion',
        'Лимонад Шие-Шабдалы': 'cold_cherry_thyme',
        'Ванильді пломбир': 'cold_vanilla_plombir',
        'Шоколадты пломбир': 'cold_chocolate_plombir',
        'Бананды пудинг': 'cold_banana_pudding',
        // Cold drinks (English names)
        'Watermelon-Mojito Lemonade': 'cold_watermelon_mojito',
        'Mango-Passion Fruit Lemonade': 'cold_mango_passion',
        'Cherry-Thyme Lemonade': 'cold_cherry_thyme',
        'Vanilla Plombir': 'cold_vanilla_plombir',
        'Chocolate Plombir': 'cold_chocolate_plombir',
        'Banana Pudding': 'cold_banana_pudding',
        // Other drinks (Kazakh names)
        'Какао': 'other_cocoa',
        'Матча латте': 'other_matcha_latte',
        'Ыстық шоколад': 'other_hot_chocolate',
        'Матча Сакура': 'other_matcha_sakura',
        // Other drinks (English names)
        'Cocoa': 'other_cocoa',
        'Matcha Latte': 'other_matcha_latte',
        'Hot Chocolate': 'other_hot_chocolate',
        'Matcha Sakura': 'other_matcha_sakura'
    };
    
    const key = nameToKey[itemName];
    const translated = key ? window.i18n.t(key) : itemName;
    // Capitalize first letter for proper display
    return translated.charAt(0).toUpperCase() + translated.slice(1);
}

// Coffee data
const coffeeData = {
    'latte': {
        name: 'Латте',
        desc: 'Классикалық эспрессо мен ыстық көбіктендірілген сүттен жасалған, үстіне кішкентай сүт көбігі салынған кофе сусыны.',
        image: 'image/menu-1.png'
    },
    'raf': {
        name: 'Раф',
        desc: 'Эспрессо, қою кілегей және ванильді қанттың қоспасы біртекті кілегейлі массаға дейін араластырылған.',
        image: 'image/menu-2.png'
    },
    'flatwhite': {
        name: 'Флэт Уайт',
        desc: 'Қос эспрессо мен жібектей сүтті көбіктің жұқа қабатының арқасында бай кофе дәмін беретін "жалпақ ақ" кофе.',
        image: 'image/menu-3.png'
    },
    'mocha': {
        name: 'Мокка',
        desc: 'Шоколадты мокка тәтті дәм сүйетіндерге.',
        image: 'image/menu-4.png'
    },
    'americano': {
        name: 'Американо',
        desc: 'Эспрессоны ыстық сумен сұйылту арқылы жасалған классикалық кофе сусыны, оның дәмін эспрессоға қарағанда жұмсақ және аз концентрлі етеді.',
        image: 'image/menu-5.png'
    },
    'cappuccino': {
        name: 'Каппучино',
        desc: 'Жұмсақ дәмі бар кремді капучино сүтпен.',
        image: 'image/menu-6.png'
    }
};

// Open modal when coffee card is clicked
function setupCoffeeCards() {
    const coffeeSlide = document.querySelector('.order-slider .swiper-slide:first-child');
    if (!coffeeSlide) return;
    
    const coffeeCards = coffeeSlide.querySelectorAll('.drink-card');
    coffeeCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const drinkType = card.getAttribute('data-drink');
            const coffee = coffeeData[drinkType];
            
            if (coffee) {
                modalCoffeeName.textContent = getTranslatedDrinkName(drinkType);
                modalCoffeeDesc.textContent = getTranslatedDrinkDesc(drinkType);
                modalCoffeeImage.src = coffee.image;
                
                // Show/hide alternative milk section based on coffee type
                const altMilkSection = document.getElementById('altMilkSection');
                const milkCoffees = ['latte', 'cappuccino', 'flatwhite'];
                if (milkCoffees.includes(drinkType)) {
                    altMilkSection.style.display = 'block';
                } else {
                    altMilkSection.style.display = 'none';
                }
                
                // Show/hide size options based on coffee type
                const modalSizeCards = document.querySelectorAll('#coffeeModal .modal-size-card');
                const sizeSection = document.querySelector('#coffeeModal .modal-size-options');
                const sizeSectionTitle = document.querySelector('#coffeeModal .modal-section-title');
                
                if (drinkType === 'flatwhite') {
                    // Флэт Уайт - скрыть выбор размера, использовать только средний
                    if (sizeSection) sizeSection.style.display = 'none';
                    if (sizeSectionTitle && sizeSectionTitle.textContent.includes('Көлемін')) {
                        sizeSectionTitle.style.display = 'none';
                    }
                    // Установить средний размер по умолчанию
                    modalSizeCards.forEach(sc => sc.classList.remove('active'));
                    const mediumSize = document.querySelector('#coffeeModal .modal-size-card[data-size="350"]');
                    if (mediumSize) mediumSize.classList.add('active');
                } else {
                    // Показать выбор размера для других кофе
                    if (sizeSection) sizeSection.style.display = 'grid';
                    if (sizeSectionTitle && sizeSectionTitle.textContent.includes('Көлемін')) {
                        sizeSectionTitle.style.display = 'block';
                    }
                    
                    // Для Латте - скрыть маленький стакан
                    const smallSize = document.querySelector('#coffeeModal .modal-size-card[data-size="250"]');
                    if (drinkType === 'latte') {
                        if (smallSize) smallSize.style.display = 'none';
                    } else {
                        if (smallSize) smallSize.style.display = 'block';
                    }
                    
                    // Reset to default size
                    modalSizeCards.forEach(sc => sc.classList.remove('active'));
                    const defaultSize = document.querySelector('#coffeeModal .modal-size-card[data-size="350"]');
                    if (defaultSize) {
                        defaultSize.classList.add('active');
                    }
                }
                
                // Reset quantity
                coffeeQtyInput.value = 1;
                
                // Reset all options
                resetCoffeeOptions();
                
                updateCoffeeTotal();
                
                coffeeModal.setAttribute('data-current-drink', drinkType);
                coffeeModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
}

// Reset coffee options
function resetCoffeeOptions() {
    // Reset syrups
    document.querySelectorAll('#coffeeModal input[name="syrup"]').forEach(input => {
        input.checked = false;
    });
    
    // Reset alternative milk
    document.querySelectorAll('#coffeeModal input[name="altMilk"]').forEach(input => {
        input.checked = false;
    });
    
    // Reset sugar to "none"
    const noneOption = document.querySelector('#coffeeModal input[name="sugar"][value="none"]');
    if (noneOption) {
        noneOption.checked = true;
    }
}

// Close modal
function closeModalFunc() {
    coffeeModal.classList.remove('active');
    document.body.style.overflow = '';
}

closeModal.addEventListener('click', closeModalFunc);

coffeeModal.addEventListener('click', (e) => {
    if (e.target === coffeeModal) {
        closeModalFunc();
    }
});

// Coffee quantity controls
const coffeeQtyInput = document.getElementById('coffeeQtyInput');
const coffeeQtyPlus = document.getElementById('coffeeQtyPlus');
const coffeeQtyMinus = document.getElementById('coffeeQtyMinus');

// Coffee comment
const coffeeComment = document.getElementById('coffeeComment');
const coffeeCommentCounter = document.getElementById('coffeeCommentCounter');

coffeeComment.addEventListener('input', () => {
    coffeeCommentCounter.textContent = coffeeComment.value.length;
});

coffeeQtyPlus.addEventListener('click', () => {
    let qty = parseInt(coffeeQtyInput.value) || 1;
    if (qty < 999) {
        coffeeQtyInput.value = qty + 1;
        updateCoffeeTotal();
    }
});

coffeeQtyMinus.addEventListener('click', () => {
    let qty = parseInt(coffeeQtyInput.value) || 1;
    if (qty > 1) {
        coffeeQtyInput.value = qty - 1;
        updateCoffeeTotal();
    }
});

// Handle manual input
coffeeQtyInput.addEventListener('input', () => {
    let qty = parseInt(coffeeQtyInput.value);
    if (isNaN(qty) || qty < 1) {
        coffeeQtyInput.value = 1;
    } else if (qty > 999) {
        coffeeQtyInput.value = 999;
    }
    updateCoffeeTotal();
});

function updateCoffeeTotal() {
    const selectedSize = document.querySelector('#coffeeModal .modal-size-card.active');
    const pricePerItem = parseInt(selectedSize.getAttribute('data-price'));
    const qty = parseInt(coffeeQtyInput.value);
    
    // Calculate extras
    let extrasPrice = 0;
    
    // Add syrup prices
    document.querySelectorAll('#coffeeModal input[name="syrup"]:checked').forEach(input => {
        extrasPrice += parseInt(input.getAttribute('data-price'));
    });
    
    // Add alternative milk price
    const selectedMilk = document.querySelector('#coffeeModal input[name="altMilk"]:checked');
    if (selectedMilk) {
        extrasPrice += parseInt(selectedMilk.getAttribute('data-price'));
    }
    
    // Sugar is free, no need to add
    
    const total = (pricePerItem + extrasPrice) * qty;
    modalTotalPrice.textContent = total + '₸';
}

// Modal size selection
const modalSizeCards = document.querySelectorAll('#coffeeModal .modal-size-card');
modalSizeCards.forEach(card => {
    card.addEventListener('click', () => {
        modalSizeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        updateCoffeeTotal();
    });
});

// Add event listeners for coffee options
document.querySelectorAll('#coffeeModal input[name="syrup"]').forEach(input => {
    input.addEventListener('change', updateCoffeeTotal);
});

document.querySelectorAll('#coffeeModal input[name="altMilk"]').forEach(input => {
    input.addEventListener('change', updateCoffeeTotal);
});

document.querySelectorAll('#coffeeModal input[name="sugar"]').forEach(input => {
    input.addEventListener('change', updateCoffeeTotal);
});

// Modal add to cart
modalAddToCart.addEventListener('click', () => {
    const selectedSize = document.querySelector('#coffeeModal .modal-size-card.active');
    const coffeeName = modalCoffeeName.textContent;
    const size = selectedSize.getAttribute('data-size');
    const qty = coffeeQtyInput.value;
    const total = modalTotalPrice.textContent;
    
    // Collect selected options
    const options = [];
    
    // Get selected syrups
    const selectedSyrups = [];
    document.querySelectorAll('#coffeeModal input[name="syrup"]:checked').forEach(input => {
        const syrupNames = {
            'caramel': 'Карамель',
            'salted-caramel': 'Тұзды карамель',
            'vanilla': 'Ваниль',
            'coconut': 'Кокос',
            'popcorn': 'Попкорн',
            'irish-cream': 'Айриш крим'
        };
        selectedSyrups.push(syrupNames[input.value]);
    });
    if (selectedSyrups.length > 0) {
        options.push(`Сироптар: ${selectedSyrups.join(', ')}`);
    }
    
    // Get selected alternative milk
    const selectedMilk = document.querySelector('#coffeeModal input[name="altMilk"]:checked');
    if (selectedMilk) {
        const milkNames = {
            'coconut': 'Кокос сүті',
            'almond': 'Бадам сүті',
            'hazelnut': 'Жаңғақ сүті',
            'oat': 'Сұлы сүті'
        };
        options.push(milkNames[selectedMilk.value]);
    }
    
    // Get selected sugar option
    const selectedSugar = document.querySelector('#coffeeModal input[name="sugar"]:checked');
    if (selectedSugar && selectedSugar.value !== 'none') {
        const sugarNames = {
            'sugar': 'Қантпен',
            'sweetener': 'Қант алмастырғышпен'
        };
        options.push(sugarNames[selectedSugar.value]);
    }
    
    // Add to cart
    const comment = coffeeComment.value.trim();
    const totalAmount = parseInt(total.replace('₸', ''));
    const cartItem = {
        name: coffeeName,
        size: size,
        quantity: parseInt(qty),
        totalPrice: totalAmount / parseInt(qty), // Цена за единицу
        image: modalCoffeeImage.src,
        options: options.join(', '),
        comment: comment,
        type: 'coffee'
    };
    
    addToCart(cartItem);
    
    // Reset comment
    coffeeComment.value = '';
    coffeeCommentCounter.textContent = '0';
    
    // Animation
    modalAddToCart.style.transform = 'scale(0.95)';
    setTimeout(() => {
        modalAddToCart.style.transform = 'scale(1)';
    }, 150);
    
    // Show confirmation
    const originalText = modalAddToCart.innerHTML;
    modalAddToCart.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> ' + window.i18n.t('notification_added');
    modalAddToCart.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    
    setTimeout(() => {
        modalAddToCart.innerHTML = originalText;
        modalAddToCart.style.background = '';
        closeModalFunc();
    }, 1500);
});

// Initialize coffee cards on load
setupCoffeeCards();

// Re-initialize when slider changes
orderSwiper.on('slideChange', function () {
    setTimeout(() => {
        setupCoffeeCards();
        setupOtherDrinkCards();
    }, 100);
});

// ===== OTHER DRINKS MODAL (Tea, Cold Drinks, Other) =====

const drinkModal = document.getElementById('drinkModal');
const closeDrinkModal = document.getElementById('closeDrinkModal');
const modalDrinkAddToCart = document.getElementById('modalDrinkAddToCart');
const modalDrinkImage = document.getElementById('modalDrinkImage');
const modalDrinkName = document.getElementById('modalDrinkName');
const modalDrinkDesc = document.getElementById('modalDrinkDesc');
const modalDrinkTotalPrice = document.getElementById('modalDrinkTotalPrice');
const qtyInput = document.getElementById('qtyInput');
const qtyPlus = document.getElementById('qtyPlus');
const qtyMinus = document.getElementById('qtyMinus');

// Drink comment
const drinkComment = document.getElementById('drinkComment');
const drinkCommentCounter = document.getElementById('drinkCommentCounter');

drinkComment.addEventListener('input', () => {
    drinkCommentCounter.textContent = drinkComment.value.length;
});

let currentDrinkPrice = 890;

// All drinks data
const drinksData = {
    // Tea
    'seabuckthorn': {
        name: 'Облепихалы шай',
        desc: 'Дәрумендерге бай облепиха жидектерімен дайындалған пайдалы және дәмді шай. Иммунитетті нығайтады.',
        image: 'image/tea-1.png',
        price: 890
    },
    'berry': {
        name: 'Жидекті шай',
        desc: 'Таза жидектердің қоспасынан жасалған ароматты шай. Жаз дәмін сыйлайды.',
        image: 'image/tea-2.png',
        price: 850
    },
    'morocco': {
        name: 'Марокко шайы',
        desc: 'Жалбыз бен дәстүрлі дәмдеуіштермен дайындалған экзотикалық шай. Шығыс дәмі.',
        image: 'image/tea-3.png',
        price: 890
    },
    'ginger': {
        name: 'Имбирлі шай',
        desc: 'Жаңа имбирмен дайындалған қыздырушы шай. Суық күндерге тамаша таңдау.',
        image: 'image/tea-4.png',
        price: 890
    },
    'gluhwein': {
        name: 'Глинтвейн шай',
        desc: 'Дәмдеуіштер мен жылы хош иісті дәстүрлі глинтвейн рецептімен дайындалған шай.',
        image: 'image/tea-5.png',
        price: 890
    },
    'karak': {
        name: 'Карак шай',
        desc: 'Бұл Араб түбегі елдерінен әкелінген күшті, хош иісті сусын, ол араб қонақжайлылығының көрінісі болып табылады.',
        image: 'image/tea-6.png',
        price: 890
    },
    // Cold Drinks
    'icelatte': {
        name: 'Лимонад Қарбыз-Мохито',
        desc: 'Жазғы қарбыз бен жалбыздың сергітетін қоспасы.',
        image: 'image/LCTAM.png',
        price: 950
    },
    'iceamericano': {
        name: 'Лимонад Манго-Маракуйя',
        desc: 'Экзотикалық манго мен маракуйяның тропикалық дәмі.',
        image: 'image/LCTMM.png',
        price: 950
    },
    'frappe': {
        name: 'Лимонад Шие-Шабдалы',
        desc: 'Шие мен шабдалының жеңіл және сергітетін дәмі.',
        image: 'image/LCTVP.png',
        price: 950
    },
    'lemonade': {
        name: 'Ванильді пломбир',
        desc: 'Классикалық ванильді пломбир милкшейк.',
        image: 'image/MCTVP.png',
        price: 1050
    },
    'smoothie': {
        name: 'Шоколадты пломбир',
        desc: 'Бай шоколадты дәмі бар пломбир милкшейк.',
        image: 'image/MCTHP.png',
        price: 1050
    },
    'milkshake': {
        name: 'Бананды пудинг',
        desc: 'Кремді банан дәмі бар милкшейк.',
        image: 'image/MCTBP.png',
        price: 1050
    },
    // Other Drinks (excluding cocoa and hot chocolate - they have size selection)
    'matcha': {
        name: 'Матча латте',
        desc: 'Жапон матча шайы мен сүттің үйлесімі.',
        image: 'image/CTML.png',
        price: 1190
    },
    'rafalmond': {
        name: 'Матча Сакура',
        desc: 'Матча мен сакураның нәзік дәмі.',
        image: 'image/CTMS.png',
        price: 1290
    }
};

// Setup other drink cards (tea, cold drinks, other)
function setupOtherDrinkCards() {
    const allSlides = document.querySelectorAll('.order-slider .swiper-slide');
    
    // Skip first slide (coffee)
    for (let i = 1; i < allSlides.length; i++) {
        const slide = allSlides[i];
        const drinkCards = slide.querySelectorAll('.drink-card');
        
        drinkCards.forEach(card => {
            // Remove old listeners by cloning
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            newCard.addEventListener('click', (e) => {
                e.preventDefault();
                const drinkType = newCard.getAttribute('data-drink');
                const drink = drinksData[drinkType];
                
                if (drink) {
                    modalDrinkName.textContent = getTranslatedDrinkName(drinkType);
                    modalDrinkDesc.textContent = getTranslatedDrinkDesc(drinkType);
                    modalDrinkImage.src = drink.image;
                    currentDrinkPrice = drink.price;
                    
                    // Reset quantity
                    qtyInput.value = 1;
                    updateDrinkTotal();
                    
                    drinkModal.setAttribute('data-current-drink', drinkType);
                    drinkModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    }
}

// Close drink modal
function closeDrinkModalFunc() {
    drinkModal.classList.remove('active');
    document.body.style.overflow = '';
}

closeDrinkModal.addEventListener('click', closeDrinkModalFunc);

drinkModal.addEventListener('click', (e) => {
    if (e.target === drinkModal) {
        closeDrinkModalFunc();
    }
});

// Quantity controls
qtyPlus.addEventListener('click', () => {
    let qty = parseInt(qtyInput.value) || 1;
    if (qty < 999) {
        qtyInput.value = qty + 1;
        updateDrinkTotal();
    }
});

qtyMinus.addEventListener('click', () => {
    let qty = parseInt(qtyInput.value) || 1;
    if (qty > 1) {
        qtyInput.value = qty - 1;
        updateDrinkTotal();
    }
});

// Handle manual input
qtyInput.addEventListener('input', () => {
    let qty = parseInt(qtyInput.value);
    if (isNaN(qty) || qty < 1) {
        qtyInput.value = 1;
    } else if (qty > 999) {
        qtyInput.value = 999;
    }
    updateDrinkTotal();
});

function updateDrinkTotal() {
    const qty = parseInt(qtyInput.value);
    const total = currentDrinkPrice * qty;
    modalDrinkTotalPrice.textContent = total + '₸';
}

// Add drink to cart
modalDrinkAddToCart.addEventListener('click', () => {
    const drinkName = modalDrinkName.textContent;
    const qty = qtyInput.value;
    const total = modalDrinkTotalPrice.textContent;
    
    // Add to cart
    const comment = drinkComment.value.trim();
    const cartItem = {
        name: drinkName,
        quantity: parseInt(qty),
        totalPrice: parseInt(total.replace('₸', '')) / parseInt(qty),
        image: modalDrinkImage.src,
        options: '',
        comment: comment,
        type: 'drink'
    };
    
    addToCart(cartItem);
    
    // Reset comment
    drinkComment.value = '';
    drinkCommentCounter.textContent = '0';
    
    // Animation
    modalDrinkAddToCart.style.transform = 'scale(0.95)';
    setTimeout(() => {
        modalDrinkAddToCart.style.transform = 'scale(1)';
    }, 150);
    
    // Show confirmation
    const originalText = modalDrinkAddToCart.innerHTML;
    modalDrinkAddToCart.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> ' + window.i18n.t('notification_added');
    modalDrinkAddToCart.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    
    setTimeout(() => {
        modalDrinkAddToCart.innerHTML = originalText;
        modalDrinkAddToCart.style.background = '';
        closeDrinkModalFunc();
    }, 1500);
});

// Initialize other drink cards on load
setupOtherDrinkCards();

// ===== SHOPPING CART MODAL =====

const cartModal = document.getElementById('cartModal');
const cartBtn = document.getElementById('cartBtn');
const closeCartModal = document.getElementById('closeCartModal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Open cart modal
cartBtn.addEventListener('click', () => {
    updateCartUI();
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close cart modal
function closeCart() {
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
}

closeCartModal.addEventListener('click', closeCart);

cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        closeCart();
    }
});

// Checkout - open checkout modal
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    
    closeCart();
    openCheckoutModal();
});

// ===== CHECKOUT MODAL =====

const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutModal = document.getElementById('closeCheckoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const phoneNumber = document.getElementById('phoneNumber');
const customerName = document.getElementById('customerName');
const address = document.getElementById('address');
const addressGroup = document.getElementById('addressGroup');
const deliveryFeeRow = document.getElementById('deliveryFeeRow');
const checkoutItemsTotal = document.getElementById('checkoutItemsTotal');
const deliveryFee = document.getElementById('deliveryFee');
const checkoutTotal = document.getElementById('checkoutTotal');

const DELIVERY_FEE = 500;

function openCheckoutModal() {
    // Update totals
    const itemsTotal = getCartTotal();
    checkoutItemsTotal.textContent = itemsTotal + '₸';
    
    // Check delivery type
    updateCheckoutTotal();
    
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModalFunc() {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset card details form
    if (cardDetailsGroup) {
        cardDetailsGroup.style.display = 'none';
        if (cardNumber) cardNumber.value = '';
        if (cardHolder) cardHolder.value = '';
        if (cardExpiry) cardExpiry.value = '';
        if (cardCVV) cardCVV.value = '';
    }
    
    // Hide Kaspi QR section
    if (kaspiQRGroup) {
        kaspiQRGroup.style.display = 'none';
    }
}

closeCheckoutModal.addEventListener('click', closeCheckoutModalFunc);

checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
        closeCheckoutModalFunc();
    }
});

// Phone number formatting
phoneNumber.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.startsWith('8')) {
        value = '7' + value.slice(1);
    }
    
    if (!value.startsWith('7')) {
        value = '7' + value;
    }
    
    let formatted = '+7';
    if (value.length > 1) {
        formatted += ' (' + value.slice(1, 4);
    }
    if (value.length >= 5) {
        formatted += ') ' + value.slice(4, 7);
    }
    if (value.length >= 8) {
        formatted += '-' + value.slice(7, 9);
    }
    if (value.length >= 10) {
        formatted += '-' + value.slice(9, 11);
    }
    
    e.target.value = formatted;
});

// Delivery type change
document.querySelectorAll('input[name="deliveryType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'delivery') {
            addressGroup.style.display = 'block';
            address.required = true;
            deliveryFeeRow.style.display = 'flex';
        } else {
            addressGroup.style.display = 'none';
            address.required = false;
            deliveryFeeRow.style.display = 'none';
        }
        updateCheckoutTotal();
    });
});

// Payment method change - show/hide card details
const cardDetailsGroup = document.getElementById('cardDetailsGroup');
const cardNumber = document.getElementById('cardNumber');
const cardHolder = document.getElementById('cardHolder');
const cardExpiry = document.getElementById('cardExpiry');
const cardCVV = document.getElementById('cardCVV');

// Kaspi QR elements
const kaspiQRGroup = document.getElementById('kaspiQRGroup');

document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        // Hide all payment-specific sections first
        if (cardDetailsGroup) cardDetailsGroup.style.display = 'none';
        if (kaspiQRGroup) kaspiQRGroup.style.display = 'none';
        
        if (e.target.value === 'card') {
            cardDetailsGroup.style.display = 'block';
            cardNumber.required = true;
            cardHolder.required = true;
            cardExpiry.required = true;
            cardCVV.required = true;
        } else if (e.target.value === 'kaspi') {
            kaspiQRGroup.style.display = 'block';
            updateKaspiQRAmount();
        } else {
            // Cash payment - no additional fields needed
            if (cardNumber) {
                cardNumber.required = false;
                cardHolder.required = false;
                cardExpiry.required = false;
                cardCVV.required = false;
            }
        }
    });
});

// Card number formatting
cardNumber.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    let formatted = '';
    
    for (let i = 0; i < value.length && i < 16; i++) {
        if (i > 0 && i % 4 === 0) {
            formatted += ' ';
        }
        formatted += value[i];
    }
    
    e.target.value = formatted;
});

// Card holder - only letters and spaces, uppercase
cardHolder.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
});

// Card expiry formatting (MM/YY)
cardExpiry.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    
    e.target.value = value;
});

// CVV - only numbers
cardCVV.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

function updateCheckoutTotal() {
    const itemsTotal = getCartTotal();
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
    const total = deliveryType === 'delivery' ? itemsTotal + DELIVERY_FEE : itemsTotal;
    checkoutTotal.textContent = total + '₸';
    
    // Update QR amount if Kaspi QR is selected
    updateKaspiQRAmount();
}

// Update Kaspi QR amount display
function updateKaspiQRAmount() {
    const qrAmount = document.getElementById('qrAmount');
    if (qrAmount) {
        const itemsTotal = getCartTotal();
        const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
        const total = deliveryType === 'delivery' ? itemsTotal + DELIVERY_FEE : itemsTotal;
        qrAmount.textContent = total + '₸';
    }
}

// Form submission
checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    console.log('🔄 Form submission started...');
    
    // Check if cart is not empty
    if (!cart || cart.length === 0) {
        console.log('❌ Cart is empty');
        showAlert('notification_select_items');
        return;
    }
    
    // Check required fields
    const phone = phoneNumber.value.trim();
    const name = customerName.value.trim();
    
    if (!phone) {
        console.log('❌ Phone is empty');
        showAlert('notification_fill_fields');
        phoneNumber.focus();
        return;
    }
    
    if (!name) {
        console.log('❌ Name is empty');
        showAlert('notification_fill_fields');
        customerName.focus();
        return;
    }
    
    const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');
    if (!paymentMethodElement) {
        console.log('❌ No payment method selected');
        showAlert('notification_fill_fields');
        return;
    }
    
    const paymentMethod = paymentMethodElement.value;
    console.log('💳 Payment method:', paymentMethod);
    
    // Validate card details if card payment is selected
    if (paymentMethod === 'card') {
        console.log('🔍 Validating card details...');
        const cardNum = cardNumber.value.replace(/\s/g, '');
        const expiry = cardExpiry.value;
        const cvv = cardCVV.value;
        
        // Validate card number (16 digits)
        if (cardNum.length !== 16) {
            console.log('❌ Invalid card number length:', cardNum.length);
            showAlert('card_number_invalid');
            cardNumber.focus();
            return;
        }
        
        // Validate expiry date
        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            console.log('❌ Invalid expiry format:', expiry);
            showAlert('card_expiry_invalid');
            cardExpiry.focus();
            return;
        }
        
        const [month, year] = expiry.split('/').map(Number);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        
        if (month < 1 || month > 12) {
            console.log('❌ Invalid month:', month);
            showAlert('card_month_invalid');
            cardExpiry.focus();
            return;
        }
        
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            console.log('❌ Card expired:', year, month);
            showAlert('card_expired');
            cardExpiry.focus();
            return;
        }
        
        // Validate CVV (3 digits)
        if (cvv.length !== 3) {
            console.log('❌ Invalid CVV length:', cvv.length);
            showAlert('card_cvv_invalid');
            cardCVV.focus();
            return;
        }
        
        // Validate card holder name
        if (cardHolder.value.trim().length < 3) {
            console.log('❌ Invalid card holder name');
            showAlert('card_holder_invalid');
            cardHolder.focus();
            return;
        }
    }
    
    console.log('✅ All validations passed, processing order...');
    
    const deliveryTypeElement = document.querySelector('input[name="deliveryType"]:checked');
    const deliveryType = deliveryTypeElement ? deliveryTypeElement.value : 'pickup';
    
    const formData = {
        phone: phone,
        name: name,
        deliveryType: deliveryType,
        address: address.value || '',
        addressComment: document.getElementById('addressComment').value || '',
        paymentMethod: paymentMethod,
        items: cart,
        total: checkoutTotal.textContent
    };
    
    console.log('📋 Form data:', formData);
    
    // Add card details if card payment (masked for security)
    if (paymentMethod === 'card') {
        const cardNum = cardNumber.value.replace(/\s/g, '');
        formData.cardLast4 = cardNum.slice(-4);
        formData.cardHolder = cardHolder.value;
    }
    
    // Save order to Firebase
    const cartTotal = getCartTotal();
    const deliveryFee = formData.deliveryType === 'delivery' ? 500 : 0;
    
    const orderData = {
        customerName: formData.name || 'Customer',
        phoneNumber: formData.phone || 'Not provided',
        deliveryType: formData.deliveryType || 'pickup',
        address: formData.address || '',
        addressComment: formData.addressComment || '',
        paymentMethod: formData.paymentMethod || 'cash',
        items: formData.items.map(item => ({
            name: item.name || 'Drink',
            size: item.size || '350',
            quantity: item.quantity || 1,
            unitPrice: item.price || 0,
            totalPrice: item.totalPrice || 0,
            options: (item.syrup || item.milk || '').toString(),
            comment: (item.comment || '').toString()
        })),
        itemsTotal: cartTotal,
        deliveryFee: deliveryFee,
        total: cartTotal + deliveryFee
    };
    
    console.log('🔥 Sending to Firebase:', orderData);
    
    // Generate single order number for consistency
    const orderNumber = Date.now();
    const fullOrderNumber = 'ORD' + orderNumber;
    
    // Send to Firebase
    OrderAPI.createOrder(orderData, fullOrderNumber).then(result => {
        if (result.success) {
            console.log('✅ Заказ отправлен в Firebase:', result.orderNumber);
        } else {
            console.error('❌ Ошибка отправки заказа:', result.error);
        }
    }).catch(error => {
        console.error('❌ Ошибка:', error);
    });
    
    // Also save to localStorage as backup
    const orders = JSON.parse(localStorage.getItem('coffeeOrders')) || [];
    orders.push({
        ...formData,
        date: new Date().toISOString(),
        orderNumber: orderNumber
    });
    localStorage.setItem('coffeeOrders', JSON.stringify(orders));
    
    // Show success notification
    const paymentMethodText = {
        'cash': window.i18n ? window.i18n.t('checkout_payment_cash') : 'Cash',
        'card': window.i18n ? window.i18n.t('checkout_payment_card') : 'Card',
        'kaspi': window.i18n ? window.i18n.t('checkout_payment_kaspi') : 'Kaspi QR'
    };
    
    const deliveryText = formData.deliveryType === 'delivery' 
        ? (window.i18n ? window.i18n.t('checkout_delivery') : 'Delivery')
        : (window.i18n ? window.i18n.t('checkout_pickup') : 'Pickup');
    
    console.log('🧾 Showing receipt...');
    
    showReceipt({
        phone: formData.phone,
        name: formData.name,
        delivery: deliveryText,
        payment: paymentMethodText[formData.paymentMethod],
        total: formData.total,
        orderNumber: orderNumber,
        cardLast4: formData.cardLast4 || null
    });
    
    // Clear cart
    cart = [];
    saveCart();
    
    // Reset form
    checkoutForm.reset();
    
    // Close modal
    closeCheckoutModalFunc();
    
    console.log('✅ Order processing completed!');
});

// Initialize cart UI on page load
updateCartUI();

// ===== INFO MODAL =====

const infoModal = document.getElementById('infoModal');
const closeInfoModal = document.getElementById('closeInfoModal');
const infoIcon = document.getElementById('infoIcon');
const infoTitle = document.getElementById('infoTitle');
const infoText = document.getElementById('infoText');

const qualityCoffeeBtn = document.getElementById('qualityCoffeeBtn');
const branchesBtn = document.getElementById('branchesBtn');
const orderCoffeeBtn = document.getElementById('orderCoffeeBtn');

const infoData = {
    qualityCoffee: {
        icon: 'fas fa-coffee',
        title: {
            kk: 'Сапалы кофе',
            en: 'Quality Coffee'
        },
        content: {
            kk: `
                <p>Біздің кофеханада біз Бразилиядан әкелінген <strong>100% арабика дәндерін</strong>, Сантос сортын пайдаланамыз — бұл әлемдегі ең танымал және сүйікті сорттардың бірі. Бұл дәндер күнді плантацияларда жылы климатта өсіріледі, осының арқасында кофе жұмсақ, үйлесімді және табиғи тәтті болып шығады.</p>
                
                <p>Бразилиялық Сантос жеңіл жаңғақты реңктермен, жұмсақ шоколадты тәттілікпен және қышқылдықтың толық жоқтығымен ерекшеленеді. Өңдеу көбінесе табиғи болады, бұл дәмді тығыз және қанық етеді.</p>
                
                <p>Мұндай кофе әрбір кеседе тегіс, теңдестірілген дәм береді — эспрессо, капучино немесе фильтр болсын. Міне, сондықтан біз Бразилиядан арабиканы таңдаймыз: ол жылы, достық хош иіс, тұрақты сапа және біздің қонақтарымыз жақсы көретін классикалық дәмді сыйлайды.</p>
            `,
            en: `
                <p>In our coffee shop, we use <strong>100% Arabica beans</strong> from Brazil, Santos variety — one of the most famous and beloved varieties in the world. These beans are grown on sunny plantations in a warm climate, which makes the coffee soft, harmonious and naturally sweet.</p>
                
                <p>Brazilian Santos is distinguished by light nutty shades, soft chocolate sweetness and a complete absence of acidity. Processing is often natural, which makes the taste dense and rich.</p>
                
                <p>Such coffee gives a smooth, balanced taste in every cup — whether it's espresso, cappuccino or filter. That's why we choose Arabica from Brazil: it gives a warm, friendly aroma, consistent quality and the classic taste that our guests love.</p>
            `
        }
    },
    branches: {
        icon: 'fas fa-store',
        title: {
            kk: 'Біздің филиалдар',
            en: 'Our Branches'
        },
        content: 'branches' // Special marker for branches
    }
};

function openInfoModal(type) {
    const data = infoData[type];
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'kk';
    
    infoIcon.innerHTML = `<i class="${data.icon}"></i>`;
    infoTitle.textContent = typeof data.title === 'object' ? data.title[currentLang] : data.title;
    
    // Special handling for branches
    if (type === 'branches') {
        const branchesText = {
            kk: {
                intro: 'Астана қаласында 3 филиалымыз бар',
                branch: 'Филиал',
                hours: '08:00 - 23:00',
                openIn2gis: '2GIS-те ашу',
                viewOnMap: 'Картада көру',
                viewAll: 'Барлық филиалдарды 2GIS-те көру'
            },
            en: {
                intro: 'We have 3 branches in Astana',
                branch: 'Branch',
                hours: '08:00 - 23:00',
                openIn2gis: 'Open in 2GIS',
                viewOnMap: 'View on Map',
                viewAll: 'View all branches in 2GIS'
            }
        };
        
        const t = branchesText[currentLang];
        
        infoText.innerHTML = `
            <div class="branches-container">
                <p style="text-align: center; margin-bottom: 2rem;">${t.intro}</p>
                
                <div class="branch-list">
                    <div class="branch-item">
                        <div class="branch-info">
                            <h4><i class="fas fa-map-marker-alt"></i> ${t.branch} №1</h4>
                            <p class="branch-address">Тәуелсіздік 32, Астана</p>
                            <p class="branch-hours"><i class="far fa-clock"></i> ${t.hours}</p>
                        </div>
                        <a href="https://2gis.kz/astana/search/Тәуелсіздік%2032%20таксофон/firm/70000001078534449" target="_blank" class="branch-btn">
                            <i class="fas fa-map-marked-alt"></i> ${t.openIn2gis}
                        </a>
                    </div>
                    
                    <div class="branch-item">
                        <div class="branch-info">
                            <h4><i class="fas fa-map-marker-alt"></i> ${t.branch} №2</h4>
                            <p class="branch-address">Қорғалжын 19т, Астана</p>
                            <p class="branch-hours"><i class="far fa-clock"></i> ${t.hours}</p>
                        </div>
                        <a href="https://2gis.kz/astana/search/Қорғалжын%2019т%20таксофон" target="_blank" class="branch-btn">
                            <i class="fas fa-map-marked-alt"></i> ${t.openIn2gis}
                        </a>
                    </div>
                    
                    <div class="branch-item">
                        <div class="branch-info">
                            <h4><i class="fas fa-map-marker-alt"></i> ${t.branch} №3</h4>
                            <p class="branch-address">Мәңгілік Ел 19/2, Астана</p>
                            <p class="branch-hours"><i class="far fa-clock"></i> ${t.hours}</p>
                        </div>
                        <a href="https://2gis.kz/astana/search/Мәңгілік%20Ел%2019/2%20таксофон" target="_blank" class="branch-btn">
                            <i class="fas fa-map-marked-alt"></i> ${t.openIn2gis}
                        </a>
                    </div>
                </div>
                
                <div class="map-container">
                    <h4 style="text-align: center; margin-bottom: 1.5rem;"><i class="fas fa-map"></i> ${t.viewOnMap}</h4>
                    <div style="position:relative;overflow:hidden;">
                        <a href="https://yandex.kz/maps/163/astana/?utm_medium=mapframe&utm_source=maps" 
                           style="color:#eee;font-size:12px;position:absolute;top:0px;">Астана</a>
                        <a href="https://yandex.kz/maps/163/astana/?ll=71.430347%2C51.128422&mode=search&sll=71.430347%2C51.128422&text=Таксофон.кофе&utm_medium=mapframe&utm_source=maps&z=12" 
                           style="color:#eee;font-size:12px;position:absolute;top:14px;">Таксофон.кофе на карте Астаны</a>
                        <iframe 
                            src="https://yandex.kz/map-widget/v1/?ll=71.430347%2C51.128422&mode=search&sll=71.430347%2C51.128422&text=Таксофон.кофе&z=12" 
                            width="100%" 
                            height="400" 
                            frameborder="0" 
                            allowfullscreen="true" 
                            style="position:relative; border-radius: 1.5rem;"
                        ></iframe>
                    </div>
                    <a href="https://2gis.kz/astana/search/Таксофон.кофе" target="_blank" class="view-all-map-btn">
                        <i class="fas fa-map-marked-alt"></i> ${t.viewAll}
                    </a>
                </div>
            </div>
        `;
    } else {
        infoText.innerHTML = typeof data.content === 'object' ? data.content[currentLang] : data.content;
    }
    
    infoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeInfoModalFunc() {
    infoModal.classList.remove('active');
    document.body.style.overflow = '';
}

qualityCoffeeBtn.addEventListener('click', () => openInfoModal('qualityCoffee'));
branchesBtn.addEventListener('click', () => openInfoModal('branches'));

// Order Coffee button - scroll to order section
orderCoffeeBtn.addEventListener('click', () => {
    const orderSection = document.getElementById('order');
    if (orderSection) {
        orderSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
});

closeInfoModal.addEventListener('click', closeInfoModalFunc);

infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) {
        closeInfoModalFunc();
    }
});

// ===== HOT DRINKS MODAL (Cocoa & Hot Chocolate) with Size Selection =====

const hotDrinkModal = document.getElementById('hotDrinkModal');
const closeHotDrinkModal = document.getElementById('closeHotDrinkModal');
const modalHotDrinkAddToCart = document.getElementById('modalHotDrinkAddToCart');
const modalHotDrinkImage = document.getElementById('modalHotDrinkImage');
const modalHotDrinkName = document.getElementById('modalHotDrinkName');
const modalHotDrinkDesc = document.getElementById('modalHotDrinkDesc');
const modalHotDrinkTotalPrice = document.getElementById('modalHotDrinkTotalPrice');

// Hot drinks that need size selection
const hotDrinksData = {
    'cocoa': {
        name: 'Какао',
        desc: 'Классикалық ыстық какао сүтпен.',
        image: 'image/CTK.png'
    },
    'bumble': {
        name: 'Ыстық шоколад',
        desc: 'Бай және кремді ыстық шоколад.',
        image: 'image/CTGH.png'
    }
};

// Setup hot drink cards (cocoa & hot chocolate)
function setupHotDrinkCards() {
    const otherDrinksSlide = document.querySelectorAll('.order-slider .swiper-slide')[3]; // 4th slide
    if (!otherDrinksSlide) return;
    
    const hotDrinkCards = otherDrinksSlide.querySelectorAll('.drink-card[data-drink="cocoa"], .drink-card[data-drink="bumble"]');
    
    hotDrinkCards.forEach(card => {
        // Remove old listeners by cloning
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        newCard.addEventListener('click', (e) => {
            e.preventDefault();
            const drinkType = newCard.getAttribute('data-drink');
            const drink = hotDrinksData[drinkType];
            
            if (drink) {
                modalHotDrinkName.textContent = getTranslatedDrinkName(drinkType);
                modalHotDrinkDesc.textContent = getTranslatedDrinkDesc(drinkType);
                modalHotDrinkImage.src = drink.image;
                
                // Reset to default size (medium)
                const hotSizeCards = document.querySelectorAll('#hotDrinkModal .modal-size-card');
                hotSizeCards.forEach(sc => sc.classList.remove('active'));
                const defaultSize = document.querySelector('#hotDrinkModal .modal-size-card[data-size="350"]');
                if (defaultSize) {
                    defaultSize.classList.add('active');
                }
                
                // Reset quantity
                hotDrinkQtyInput.value = 1;
                updateHotDrinkTotal();
                
                hotDrinkModal.setAttribute('data-current-drink', drinkType);
                hotDrinkModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
}

// Close hot drink modal
function closeHotDrinkModalFunc() {
    hotDrinkModal.classList.remove('active');
    document.body.style.overflow = '';
}

closeHotDrinkModal.addEventListener('click', closeHotDrinkModalFunc);

hotDrinkModal.addEventListener('click', (e) => {
    if (e.target === hotDrinkModal) {
        closeHotDrinkModalFunc();
    }
});

// Hot drink quantity controls
const hotDrinkQtyInput = document.getElementById('hotDrinkQtyInput');
const hotDrinkQtyPlus = document.getElementById('hotDrinkQtyPlus');
const hotDrinkQtyMinus = document.getElementById('hotDrinkQtyMinus');

// Hot drink comment
const hotDrinkComment = document.getElementById('hotDrinkComment');
const hotDrinkCommentCounter = document.getElementById('hotDrinkCommentCounter');

hotDrinkComment.addEventListener('input', () => {
    hotDrinkCommentCounter.textContent = hotDrinkComment.value.length;
});

hotDrinkQtyPlus.addEventListener('click', () => {
    let qty = parseInt(hotDrinkQtyInput.value) || 1;
    if (qty < 999) {
        hotDrinkQtyInput.value = qty + 1;
        updateHotDrinkTotal();
    }
});

hotDrinkQtyMinus.addEventListener('click', () => {
    let qty = parseInt(hotDrinkQtyInput.value) || 1;
    if (qty > 1) {
        hotDrinkQtyInput.value = qty - 1;
        updateHotDrinkTotal();
    }
});

// Handle manual input
hotDrinkQtyInput.addEventListener('input', () => {
    let qty = parseInt(hotDrinkQtyInput.value);
    if (isNaN(qty) || qty < 1) {
        hotDrinkQtyInput.value = 1;
    } else if (qty > 999) {
        hotDrinkQtyInput.value = 999;
    }
    updateHotDrinkTotal();
});

function updateHotDrinkTotal() {
    const selectedSize = document.querySelector('#hotDrinkModal .modal-size-card.active');
    const pricePerItem = parseInt(selectedSize.getAttribute('data-price'));
    const qty = parseInt(hotDrinkQtyInput.value);
    const total = pricePerItem * qty;
    modalHotDrinkTotalPrice.textContent = total + '₸';
}

// Hot drink size selection
const hotDrinkSizeCards = document.querySelectorAll('#hotDrinkModal .modal-size-card');
hotDrinkSizeCards.forEach(card => {
    card.addEventListener('click', () => {
        hotDrinkSizeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        updateHotDrinkTotal();
    });
});

// Add hot drink to cart
modalHotDrinkAddToCart.addEventListener('click', () => {
    const selectedSize = document.querySelector('#hotDrinkModal .modal-size-card.active');
    const drinkName = modalHotDrinkName.textContent;
    const size = selectedSize.getAttribute('data-size');
    const qty = hotDrinkQtyInput.value;
    const total = modalHotDrinkTotalPrice.textContent;
    
    // Add to cart
    const comment = hotDrinkComment.value.trim();
    const cartItem = {
        name: drinkName,
        size: size,
        quantity: parseInt(qty),
        totalPrice: parseInt(total.replace('₸', '')) / parseInt(qty),
        image: modalHotDrinkImage.src,
        options: '',
        comment: comment,
        type: 'hotdrink'
    };
    
    addToCart(cartItem);
    
    // Reset comment
    hotDrinkComment.value = '';
    hotDrinkCommentCounter.textContent = '0';
    
    // Animation
    modalHotDrinkAddToCart.style.transform = 'scale(0.95)';
    setTimeout(() => {
        modalHotDrinkAddToCart.style.transform = 'scale(1)';
    }, 150);
    
    // Show confirmation
    const originalText = modalHotDrinkAddToCart.innerHTML;
    modalHotDrinkAddToCart.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> ' + window.i18n.t('notification_added');
    modalHotDrinkAddToCart.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    
    setTimeout(() => {
        modalHotDrinkAddToCart.innerHTML = originalText;
        modalHotDrinkAddToCart.style.background = '';
        closeHotDrinkModalFunc();
    }, 1500);
});

// Initialize hot drink cards on load
setupHotDrinkCards();

// Update setupOtherDrinkCards to exclude cocoa and hot chocolate
const originalSetupOtherDrinkCards = setupOtherDrinkCards;
setupOtherDrinkCards = function() {
    const allSlides = document.querySelectorAll('.order-slider .swiper-slide');
    
    // Skip first slide (coffee)
    for (let i = 1; i < allSlides.length; i++) {
        const slide = allSlides[i];
        const drinkCards = slide.querySelectorAll('.drink-card');
        
        drinkCards.forEach(card => {
            const drinkType = card.getAttribute('data-drink');
            
            // Skip cocoa and hot chocolate (they have their own modal)
            if (drinkType === 'cocoa' || drinkType === 'bumble') {
                return;
            }
            
            // Remove old listeners by cloning
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            newCard.addEventListener('click', (e) => {
                e.preventDefault();
                const drink = drinksData[drinkType];
                
                if (drink) {
                    modalDrinkName.textContent = getTranslatedDrinkName(drinkType);
                    modalDrinkDesc.textContent = getTranslatedDrinkDesc(drinkType);
                    modalDrinkImage.src = drink.image;
                    currentDrinkPrice = drink.price;
                    
                    // Reset quantity
                    qtyInput.value = 1;
                    updateDrinkTotal();
                    
                    drinkModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    }
    
    // Also setup hot drink cards
    setupHotDrinkCards();
};


// ===== SMOOTH SCROLL FOR NAVIGATION =====
document.querySelectorAll('.navbar a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            // Close mobile menu if open
            menu.classList.remove('fa-times');
            navbar.classList.remove('active');
            
            // Smooth scroll with custom duration
            const targetPosition = targetSection.offsetTop - 80; // 80px offset for header
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 1500; // 1.5 seconds for smooth scroll
            let start = null;
            
            function animation(currentTime) {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const run = ease(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }
            
            // Easing function for smooth animation
            function ease(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            }
            
            requestAnimationFrame(animation);
        }
    });
});

// ===== ORDER DISPLAY SYSTEM =====
class OrderDisplaySystem {
    constructor() {
        this.readyOrders = [];
        this.preparingOrders = [];
        this.updateInterval = null;
        this.soundEnabled = true;
        
        this.init();
    }
    
    init() {
        this.loadOrders();
        this.startOrderUpdates();
    }
    
    // Load orders from Firebase
    async loadOrders() {
        try {
            if (typeof OrderAPI !== 'undefined') {
                const result = await OrderAPI.getAllOrders();
                if (result.success) {
                    this.processOrders(result.orders);
                    this.renderOrders();
                }
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }
    
    // Process orders by status
    processOrders(orders) {
        const today = new Date().toDateString();
        
        this.readyOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt).toDateString();
            return order.status === 'ready' && orderDate === today;
        }).sort((a, b) => {
            const timeA = new Date(a.updatedAt?.toDate?.() || a.updatedAt);
            const timeB = new Date(b.updatedAt?.toDate?.() || b.updatedAt);
            return timeB - timeA; // Newest first
        });
        
        this.preparingOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt).toDateString();
            return (order.status === 'confirmed' || order.status === 'preparing') && orderDate === today;
        }).sort((a, b) => {
            const timeA = new Date(a.createdAt?.toDate?.() || a.createdAt);
            const timeB = new Date(b.createdAt?.toDate?.() || b.createdAt);
            return timeA - timeB; // Oldest first
        });
    }
    
    // Render orders on display
    renderOrders() {
        this.renderReadyOrders();
        this.renderPreparingOrders();
    }
    
    // Render ready orders
    renderReadyOrders() {
        const container = document.getElementById('readyOrdersGrid');
        if (!container) return;
        
        if (this.readyOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-coffee"></i>
                    <h3 data-i18n="no_ready_orders">No Ready Orders</h3>
                    <p data-i18n="orders_will_appear">Orders will appear here when ready</p>
                </div>
            `;
            // Update translations for new elements
            if (window.i18n) {
                container.querySelectorAll('[data-i18n]').forEach(element => {
                    const key = element.getAttribute('data-i18n');
                    element.textContent = window.i18n.t(key);
                });
            }
            return;
        }
        
        container.innerHTML = this.readyOrders.map(order => {
            const orderNumber = this.extractOrderNumber(order.orderNumber || order.id);
            const customerName = order.customerName || 'Customer';
            const items = this.formatOrderItems(order.items || []);
            
            return `
                <div class="order-card ready" data-order-id="${order.id}">
                    <div class="order-number">#${orderNumber}</div>
                    <div class="order-customer">${customerName}</div>
                    <div class="order-items">${items}</div>
                </div>
            `;
        }).join('');
    }
    
    // Render preparing orders
    renderPreparingOrders() {
        const container = document.getElementById('preparingOrdersList');
        if (!container) return;
        
        if (this.preparingOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p data-i18n="no_preparing_orders">No orders in preparation</p>
                </div>
            `;
            // Update translations for new elements
            if (window.i18n) {
                container.querySelectorAll('[data-i18n]').forEach(element => {
                    const key = element.getAttribute('data-i18n');
                    element.textContent = window.i18n.t(key);
                });
            }
            return;
        }
        
        container.innerHTML = this.preparingOrders.map(order => {
            const orderNumber = this.extractOrderNumber(order.orderNumber || order.id);
            const customerName = order.customerName || 'Customer';
            
            return `
                <div class="preparing-order" data-order-id="${order.id}">
                    <div class="order-number">#${orderNumber}</div>
                    <div class="order-customer">${customerName}</div>
                </div>
            `;
        }).join('');
    }
    
    // Extract order number from full order number
    extractOrderNumber(fullOrderNumber) {
        if (!fullOrderNumber) return '000';
        
        // If it's already a full timestamp number, return it as is
        if (fullOrderNumber.toString().length >= 10 && !fullOrderNumber.toString().startsWith('ORD')) {
            return fullOrderNumber.toString();
        }
        
        // If it starts with ORD, remove the prefix
        if (fullOrderNumber.toString().startsWith('ORD')) {
            return fullOrderNumber.toString().replace('ORD', '');
        }
        
        // Otherwise return as is
        return fullOrderNumber.toString();
    }
    
    // Format order items for display
    formatOrderItems(items) {
        if (!items || items.length === 0) return 'No items';
        
        return items.map(item => {
            const name = item.name || 'Item';
            const quantity = item.quantity || 1;
            const size = item.size ? ` (${item.size}ml)` : '';
            return `${quantity}x ${name}${size}`;
        }).join(', ');
    }
    
    // Start real-time order updates
    startOrderUpdates() {
        // Listen for real-time updates from Firebase
        if (window.db) {
            window.db.collection('orders')
                .where('status', 'in', ['ready', 'confirmed', 'preparing'])
                .onSnapshot((snapshot) => {
                    console.log('Orders updated, refreshing display...');
                    this.loadOrders();
                });
        }
        
        // Fallback: Update every 30 seconds
        this.updateInterval = setInterval(() => {
            this.loadOrders();
        }, 30000);
    }
    
    // Cleanup
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize Order Display System when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to initialize
    setTimeout(() => {
        window.orderDisplaySystem = new OrderDisplaySystem();
        console.log('Order Display System initialized');
    }, 2000);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.orderDisplaySystem) {
        window.orderDisplaySystem.destroy();
    }
});


// ===== AUTO SCROLL TO ORDER SECTION =====
// Scroll to order section when clicking on "Тапсырыс" in navbar
document.querySelectorAll('.navbar a[href="#order"]').forEach(link => {
    link.addEventListener('click', function(e) {
        setTimeout(() => {
            const orderSection = document.querySelector('#order');
            if (orderSection) {
                const headerOffset = 100;
                const elementPosition = orderSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    });
});

// ===== SMOOTH CATEGORY TRANSITION =====
// Add smooth transition effect when switching categories
const orderSwiperContainer = document.querySelector('.order-slider');
if (orderSwiperContainer) {
    orderSwiperContainer.style.transition = 'opacity 0.3s ease';
}

// Enhance category button clicks with smooth scroll
const categoryButtonsEnhanced = document.querySelectorAll('.category-btn');
categoryButtonsEnhanced.forEach(btn => {
    btn.addEventListener('click', () => {
        // Smooth scroll to top of order section
        const orderSection = document.querySelector('#order');
        if (orderSection) {
            const headerOffset = 100;
            const elementPosition = orderSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});


// ===== MENU COFFEE ITEMS - OPEN MODAL ON CLICK =====
function setupMenuCoffeeItems() {
    const menuCoffeeItems = document.querySelectorAll('.menu-coffee-item');
    
    menuCoffeeItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const coffeeType = this.getAttribute('data-coffee');
            const coffee = coffeeData[coffeeType];
            
            if (coffee) {
                // Scroll to order section first
                const orderSection = document.querySelector('#order');
                if (orderSection) {
                    const headerOffset = 80;
                    const elementPosition = orderSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
                
                // Wait for scroll to complete, then open modal
                setTimeout(() => {
                    // Make sure we're on coffee category (slide 0)
                    if (orderSwiper) {
                        orderSwiper.slideTo(0);
                    }
                    
                    // Set modal content
                    modalCoffeeName.textContent = getTranslatedDrinkName(coffeeType);
                    modalCoffeeDesc.textContent = getTranslatedDrinkDesc(coffeeType);
                    modalCoffeeImage.src = coffee.image;
                    
                    // Show/hide alternative milk section
                    const altMilkSection = document.getElementById('altMilkSection');
                    const milkCoffees = ['latte', 'cappuccino', 'flatwhite'];
                    if (milkCoffees.includes(coffeeType)) {
                        altMilkSection.style.display = 'block';
                    } else {
                        altMilkSection.style.display = 'none';
                    }
                    
                    // Handle size options
                    const modalSizeCards = document.querySelectorAll('#coffeeModal .modal-size-card');
                    const sizeSection = document.querySelector('#coffeeModal .modal-size-options');
                    const sizeSectionTitle = document.querySelector('#coffeeModal .modal-section-title');
                    
                    if (coffeeType === 'flatwhite') {
                        if (sizeSection) sizeSection.style.display = 'none';
                        if (sizeSectionTitle && sizeSectionTitle.textContent.includes('Көлемін')) {
                            sizeSectionTitle.style.display = 'none';
                        }
                        modalSizeCards.forEach(sc => sc.classList.remove('active'));
                        const mediumSize = document.querySelector('#coffeeModal .modal-size-card[data-size="350"]');
                        if (mediumSize) mediumSize.classList.add('active');
                    } else {
                        if (sizeSection) sizeSection.style.display = 'grid';
                        if (sizeSectionTitle && sizeSectionTitle.textContent.includes('Көлемін')) {
                            sizeSectionTitle.style.display = 'block';
                        }
                        
                        const smallSize = document.querySelector('#coffeeModal .modal-size-card[data-size="250"]');
                        if (coffeeType === 'latte') {
                            if (smallSize) smallSize.style.display = 'none';
                        } else {
                            if (smallSize) smallSize.style.display = 'block';
                        }
                        
                        modalSizeCards.forEach(sc => sc.classList.remove('active'));
                        const defaultSize = document.querySelector('#coffeeModal .modal-size-card[data-size="350"]');
                        if (defaultSize) {
                            defaultSize.classList.add('active');
                        }
                    }
                    
                    // Reset quantity
                    coffeeQtyInput.value = 1;
                    
                    // Reset all options
                    resetCoffeeOptions();
                    
                    updateCoffeeTotal();
                    
                    // Open modal
                    coffeeModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }, 800); // Wait for scroll animation
            }
        });
    });
}

// ===== MENU TEA ITEMS - SCROLL TO ORDER ON CLICK =====
function setupMenuTeaItems() {
    const menuTeaItems = document.querySelectorAll('.menu-tea-item');
    
    menuTeaItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Scroll to order section
            const orderSection = document.querySelector('#order');
            if (orderSection) {
                const headerOffset = 80;
                const elementPosition = orderSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Switch to tea category (slide 1)
                setTimeout(() => {
                    const orderSlider = document.querySelector('.order-slider').swiper;
                    if (orderSlider) {
                        orderSlider.slideTo(1); // Tea is slide 1
                    }
                    
                    // Switch category button
                    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                    document.querySelector('.category-btn[data-category="1"]')?.classList.add('active');
                }, 500);
            }
        });
    });
}

// Initialize menu coffee items
setupMenuCoffeeItems();
setupMenuTeaItems();


// ===== TRANSLATED ALERTS =====
function showAlert(messageKey) {
    const lang = localStorage.getItem('language') || 'kk';
    const messages = {
        kk: {
            card_number_invalid: '❌ Карта номері дұрыс емес! 16 сан болуы керек.',
            card_expiry_invalid: '❌ Жарамдылық мерзімі дұрыс емес! MM/YY форматында болуы керек.',
            card_month_invalid: '❌ Ай дұрыс емес! 01-ден 12-ге дейін болуы керек.',
            card_expired: '❌ Карта мерзімі өтіп кеткен!',
            card_cvv_invalid: '❌ CVV коды дұрыс емес! 3 сан болуы керек.',
            card_holder_invalid: '❌ Карта иесінің аты дұрыс емес!',
            order_success: '✅ Тапсырыс сәтті жіберілді!',
            order_error: '❌ Тапсырыс жіберу қатесі!',
            fill_all_fields: '❌ Барлық міндетті өрістерді толтырыңыз!'
        },
        en: {
            card_number_invalid: '❌ Invalid card number! Must be 16 digits.',
            card_expiry_invalid: '❌ Invalid expiry date! Must be in MM/YY format.',
            card_month_invalid: '❌ Invalid month! Must be between 01 and 12.',
            card_expired: '❌ Card has expired!',
            card_cvv_invalid: '❌ Invalid CVV code! Must be 3 digits.',
            card_holder_invalid: '❌ Invalid cardholder name!',
            order_success: '✅ Order placed successfully!',
            order_error: '❌ Error placing order!',
            fill_all_fields: '❌ Please fill all required fields!'
        }
    };
    
    alert(messages[lang][messageKey] || messageKey);
}

// ===== TOAST NOTIFICATION =====
function showToast(itemName, quantity) {
    const toast = document.getElementById('toastNotification');
    const toastMessage = toast.querySelector('.toast-message');
    
    const lang = localStorage.getItem('language') || 'kk';
    const quantityText = lang === 'en' ? 'pcs' : 'дана';
    
    toastMessage.textContent = `${itemName} (${quantity} ${quantityText})`;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Update addToCart function to show toast
const originalAddToCart = addToCart;
addToCart = function(item) {
    originalAddToCart(item);
    showToast(item.name, item.quantity);
};


// ===== RECEIPT MODAL =====
function showReceipt(orderData) {
    const receiptModal = document.getElementById('receiptModal');
    
    // Populate receipt data
    document.getElementById('receiptDate').textContent = new Date().toLocaleString('kk-KZ');
    document.getElementById('receiptCustomer').textContent = orderData.name || 'Клиент';
    document.getElementById('receiptPhone').textContent = orderData.phone || '+7 (___) ___-__-__';
    document.getElementById('receiptDelivery').textContent = orderData.delivery || 'Өзім аламын';
    document.getElementById('receiptPayment').textContent = orderData.payment + (orderData.cardLast4 ? ' •••• ' + orderData.cardLast4 : '');
    document.getElementById('receiptOrderNumber').textContent = '#' + (orderData.orderNumber || '1234');
    document.getElementById('receiptTotal').textContent = orderData.total || '0₸';
    
    // Populate items
    const itemsList = document.getElementById('receiptItemsList');
    if (cart && cart.length > 0) {
        itemsList.innerHTML = cart.map(item => `
            <div class="receipt-item">
                <div class="item-details">
                    <div class="item-name">${translateCartItemName(item.name)}</div>
                    <span class="item-quantity">${item.quantity}x</span>
                    ${item.size ? `<span class="item-quantity">(${item.size}ml)</span>` : ''}
                    ${item.options ? `<div style="font-size: 1.2rem; color: #666;">${item.options}</div>` : ''}
                    ${item.comment ? `<div style="font-size: 1.2rem; color: #8B6F47; font-style: italic;">"${item.comment}"</div>` : ''}
                </div>
                <div class="item-price">${(item.totalPrice * item.quantity)}₸</div>
            </div>
        `).join('');
    } else {
        itemsList.innerHTML = '<div class="receipt-item"><div class="item-details">Тауарлар жоқ</div></div>';
    }
    
    // Show modal
    receiptModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update translations
    if (window.i18n) {
        receiptModal.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = window.i18n.t(key);
        });
    }
}

function closeReceiptModal() {
    const receiptModal = document.getElementById('receiptModal');
    receiptModal.classList.remove('active');
    document.body.style.overflow = '';
}

function scrollToOrderDisplay() {
    closeReceiptModal();
    const orderDisplaySection = document.getElementById('order-display');
    if (orderDisplaySection) {
        orderDisplaySection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function printReceipt() {
    const receiptContent = document.querySelector('#receiptModal .receipt').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Чек - Taksofon Coffee</title>
            <link rel="stylesheet" href="css/receipt.css">
            <style>
                body { margin: 0; padding: 20px; background: white; }
                .receipt { max-width: 100%; box-shadow: none; border: 2px solid #000; }
                .receipt-actions { display: none; }
                @media print {
                    body { padding: 0; }
                    .receipt-actions { display: none !important; }
                }
            </style>
        </head>
        <body>
            <div class="receipt">${receiptContent}</div>
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    }
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Close receipt modal when clicking outside
document.addEventListener('click', (e) => {
    const receiptModal = document.getElementById('receiptModal');
    if (e.target === receiptModal) {
        closeReceiptModal();
    }
});

// Close receipt modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const receiptModal = document.getElementById('receiptModal');
        if (receiptModal && receiptModal.classList.contains('active')) {
            closeReceiptModal();
        }
    }
});


// ===== VALIDATION TOAST =====
function showValidationError(message, inputElement) {
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'validation-toast error';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Focus input
    if (inputElement) {
        inputElement.focus();
        inputElement.classList.add('input-error');
        
        // Remove error class on input
        setTimeout(() => {
            inputElement.classList.remove('input-error');
        }, 3000);
    }
    
    // Remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}
