// ===== REVIEW FORM HANDLING =====

// Элементы формы
const reviewForm = document.getElementById('reviewForm');
const reviewText = document.getElementById('reviewText');
const reviewCharCount = document.getElementById('reviewCharCount');
const reviewPhoto = document.getElementById('reviewPhoto');
const photoPreview = document.getElementById('photoPreview');
const reviewPhone = document.getElementById('reviewPhone');

// Счетчик символов
if (reviewText && reviewCharCount) {
    reviewText.addEventListener('input', () => {
        reviewCharCount.textContent = reviewText.value.length;
    });
}

// Форматирование телефона
if (reviewPhone) {
    reviewPhone.addEventListener('input', (e) => {
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
}

// Предпросмотр фото
if (reviewPhoto && photoPreview) {
    reviewPhoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'kk';
            const messages = {
                kk: {
                    tooLarge: 'Файл тым үлкен! Ең көбі 1MB',
                    onlyImages: 'Тек суреттерді жүктеуге болады!',
                    remove: 'Жою'
                },
                en: {
                    tooLarge: 'File is too large! Maximum 1MB',
                    onlyImages: 'Only images can be uploaded!',
                    remove: 'Remove'
                }
            };
            
            // Проверка размера (1MB для Base64)
            if (file.size > 1 * 1024 * 1024) {
                alert(messages[currentLang].tooLarge);
                reviewPhoto.value = '';
                return;
            }
            
            // Проверка типа
            if (!file.type.startsWith('image/')) {
                alert(messages[currentLang].onlyImages);
                reviewPhoto.value = '';
                return;
            }
            
            // Показать превью
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <div class="photo-preview-actions">
                        <button type="button" class="remove-photo-btn" onclick="removePhoto()">
                            <i class="fas fa-times"></i> ${messages[currentLang].remove}
                        </button>
                    </div>
                `;
                photoPreview.classList.add('active');
            };
            reader.readAsDataURL(file);
        }
    });
}

// Удалить фото (глобальная функция)
window.removePhoto = function() {
    if (reviewPhoto) reviewPhoto.value = '';
    if (photoPreview) {
        photoPreview.innerHTML = '';
        photoPreview.classList.remove('active');
    }
}

// Отправка формы
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Проверка рейтинга
        const rating = document.querySelector('input[name="rating"]:checked');
        if (!rating) {
            alert('Өтінеміз, бағалаңыз!');
            return;
        }
        
        // Показать загрузку
        const submitBtn = reviewForm.querySelector('.submit-review-btn');
        const originalText = submitBtn.innerHTML;
        const loadingText = window.i18n ? window.i18n.t('review_submitting') : 'Submitting...';
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
        submitBtn.disabled = true;
        
        try {
            // Собрать данные
            const formData = {
                name: document.getElementById('reviewName').value,
                phone: reviewPhone.value || null,
                rating: rating.value,
                review: reviewText.value
            };
            
            // Получить файл фото
            const photoFile = reviewPhoto.files[0] || null;
            
            // Отправить отзыв
            const result = await ReviewsAPI.createReview(formData, photoFile);
            
            if (result.success) {
                // Показать успех
                showReviewSuccess();
                
                // Очистить форму
                reviewForm.reset();
                removePhoto();
                reviewCharCount.textContent = '0';
                
                // Сбросить рейтинг
                document.querySelectorAll('input[name="rating"]').forEach(input => {
                    input.checked = false;
                });
            } else {
                throw new Error(result.error || 'Пікір жіберу қатесі');
            }
        } catch (error) {
            console.error('Қате:', error);
            alert('Пікір жіберу қатесі: ' + error.message);
        } finally {
            // Восстановить кнопку
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Показать уведомление об успехе
function showReviewSuccess() {
    const notification = document.createElement('div');
    notification.className = 'review-success-notification';
    notification.innerHTML = `
        <div class="review-success-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 data-i18n="review_success_title">${window.i18n ? window.i18n.t('review_success_title') : 'Thank you!'}</h3>
            <p data-i18n="review_success_message">${window.i18n ? window.i18n.t('review_success_message') : 'Your review has been received'}</p>
            <small data-i18n="review_success_note">${window.i18n ? window.i18n.t('review_success_note') : 'It will be displayed on the site after moderation'}</small>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// ===== LOAD APPROVED REVIEWS =====
async function loadApprovedReviews() {
    try {
        const result = await ReviewsAPI.getApprovedReviews();
        
        if (result.success && result.reviews.length > 0) {
            // Обновить слайдер с отзывами
            updateReviewSlider(result.reviews);
        }
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
    }
}

// Обновить слайдер отзывов
function updateReviewSlider(reviews) {
    const swiperWrapper = document.querySelector('.review-slider .swiper-wrapper');
    if (!swiperWrapper) {
        console.warn('⚠️ Swiper wrapper не найден');
        return;
    }
    
    // Очищаем ВСЁ (включая placeholder)
    swiperWrapper.innerHTML = '';
    
    console.log(`📝 Загружено ${reviews.length} отзывов из Firebase`);
    
    if (reviews.length === 0) {
        // Если отзывов нет - показываем сообщение
        swiperWrapper.innerHTML = `
            <div class="swiper-slide box" style="text-align: center; padding: 40px;">
                <i class="fas fa-comment-slash" style="font-size: 48px; color: #95a5a6;"></i>
                <p style="margin-top: 20px; color: #7f8c8d;">Пока нет отзывов</p>
            </div>
        `;
        return;
    }
    
    // Добавить отзывы из Firebase
    reviews.forEach(review => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide box';
        
        // Генерация звезд
        let starsHTML = '';
        for (let i = 0; i < 5; i++) {
            if (i < review.rating) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else {
                starsHTML += '<i class="far fa-star"></i>';
            }
        }
        
        // Определение статуса клиента по рейтингу
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'kk';
        const ratingLabels = {
            kk: {
                5: 'Қанағаттанған клиент',
                4: 'Жақсы әсер алған клиент',
                3: 'Бейтарап клиент',
                2: 'Қанағаттанбаған клиент',
                1: 'Өте қанағаттанбаған клиент'
            },
            en: {
                5: 'Satisfied customer',
                4: 'Good impression',
                3: 'Neutral customer',
                2: 'Dissatisfied customer',
                1: 'Very dissatisfied customer'
            }
        };
        
        const customerStatus = ratingLabels[currentLang][review.rating] || ratingLabels[currentLang][5];
        
        // Фото или дефолтное изображение
        const photoUrl = review.photoUrl || 'image/default-avatar.svg';
        
        slide.innerHTML = `
            <i class="fas fa-quote-left"></i>
            <i class="fas fa-quote-right"></i>
            <img src="${photoUrl}" alt="${review.customerName}" onerror="this.src='image/default-avatar.svg'">
            <div class="stars">
                ${starsHTML}
            </div>
            <p>${review.reviewText}</p>
            <h3>${review.customerName}</h3>
            <span>${customerStatus}</span>
        `;
        
        swiperWrapper.appendChild(slide);
    });
    
    // Обновить Swiper
    if (typeof Swiper !== 'undefined') {
        const swiperElement = document.querySelector('.review-slider');
        const reviewSwiper = swiperElement?.swiper;
        
        if (reviewSwiper) {
            reviewSwiper.update(); // Обновляем Swiper
            reviewSwiper.slideTo(0); // Переходим на первый слайд
            
            console.log('✅ Swiper обновлен, всего слайдов:', reviewSwiper.slides.length);
        }
    }
}

// Загрузить отзывы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем что Firebase готов
    if (typeof db !== 'undefined' && typeof ReviewsAPI !== 'undefined') {
        console.log('🔄 Загружаю отзывы из Firebase...');
        loadApprovedReviews();
    } else {
        console.warn('⚠️ Firebase не готов, отзывы не загружены');
    }
});

console.log('✅ Reviews form готов');

// ===== TRANSLATION AND LANGUAGE CHANGE SUPPORT =====

// Кэш отзывов для перезагрузки при смене языка
let cachedReviews = [];

// Транслитерация казахских имен в латиницу
function transliterateKazakhToLatin(text) {
    if (!text) return text;
    
    const translitMap = {
        'А': 'A', 'а': 'a',
        'Ә': 'A', 'ә': 'a',
        'Б': 'B', 'б': 'b',
        'В': 'V', 'в': 'v',
        'Г': 'G', 'г': 'g',
        'Ғ': 'G', 'ғ': 'g',
        'Д': 'D', 'д': 'd',
        'Е': 'E', 'е': 'e',
        'Ё': 'Yo', 'ё': 'yo',
        'Ж': 'Zh', 'ж': 'zh',
        'З': 'Z', 'з': 'z',
        'И': 'I', 'и': 'i',
        'Й': 'Y', 'й': 'y',
        'К': 'K', 'к': 'k',
        'Қ': 'Q', 'қ': 'q',
        'Л': 'L', 'л': 'l',
        'М': 'M', 'м': 'm',
        'Н': 'N', 'н': 'n',
        'Ң': 'N', 'ң': 'n',
        'О': 'O', 'о': 'o',
        'Ө': 'O', 'ө': 'o',
        'П': 'P', 'п': 'p',
        'Р': 'R', 'р': 'r',
        'С': 'S', 'с': 's',
        'Т': 'T', 'т': 't',
        'У': 'U', 'у': 'u',
        'Ұ': 'U', 'ұ': 'u',
        'Ү': 'U', 'ү': 'u',
        'Ф': 'F', 'ф': 'f',
        'Х': 'Kh', 'х': 'kh',
        'Һ': 'H', 'һ': 'h',
        'Ц': 'Ts', 'ц': 'ts',
        'Ч': 'Ch', 'ч': 'ch',
        'Ш': 'Sh', 'ш': 'sh',
        'Щ': 'Shch', 'щ': 'shch',
        'Ъ': '', 'ъ': '',
        'Ы': 'Y', 'ы': 'y',
        'І': 'I', 'і': 'i',
        'Ь': '', 'ь': '',
        'Э': 'E', 'э': 'e',
        'Ю': 'Yu', 'ю': 'yu',
        'Я': 'Ya', 'я': 'ya'
    };
    
    let result = '';
    for (let char of text) {
        result += translitMap[char] || char;
    }
    
    return result;
}

// Простой перевод текста (используем Google Translate API)
async function translateText(text, targetLang) {
    if (targetLang === 'kk' || !text) return text; // Оригинал на казахском
    
    try {
        // Используем бесплатный API Google Translate
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=kk&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        // Google Translate возвращает массив массивов с переводом
        // Нужно собрать все части перевода
        if (data && data[0]) {
            let translatedText = '';
            for (let i = 0; i < data[0].length; i++) {
                if (data[0][i][0]) {
                    translatedText += data[0][i][0];
                }
            }
            
            if (translatedText) {
                console.log('✅ Переведено:', text.substring(0, 50) + '... → ' + translatedText.substring(0, 50) + '...');
                return translatedText;
            }
        }
    } catch (error) {
        console.warn('⚠️ Ошибка перевода, используем оригинал:', error);
    }
    
    return text; // Возвращаем оригинал если перевод не удался
}

// Улучшенная функция обновления слайдера с переводом
async function updateReviewSliderWithTranslation(reviews) {
    const swiperWrapper = document.querySelector('.review-slider .swiper-wrapper');
    if (!swiperWrapper) {
        console.warn('⚠️ Swiper wrapper не найден');
        return;
    }
    
    // Очищаем ВСЁ
    swiperWrapper.innerHTML = '';
    
    if (reviews.length === 0) {
        swiperWrapper.innerHTML = `
            <div class="swiper-slide box" style="text-align: center; padding: 40px;">
                <i class="fas fa-comment-slash" style="font-size: 48px; color: #95a5a6;"></i>
                <p style="margin-top: 20px; color: #7f8c8d;">Пока нет отзывов</p>
            </div>
        `;
        return;
    }
    
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'kk';
    
    // Обрабатываем отзывы последовательно для перевода
    for (const review of reviews) {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide box';
        
        // Генерация звезд
        let starsHTML = '';
        for (let i = 0; i < 5; i++) {
            if (i < review.rating) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else {
                starsHTML += '<i class="far fa-star"></i>';
            }
        }
        
        // Определение статуса клиента по рейтингу
        const ratingLabels = {
            kk: {
                5: 'Қанағаттанған клиент',
                4: 'Жақсы әсер алған клиент',
                3: 'Бейтарап клиент',
                2: 'Қанағаттанбаған клиент',
                1: 'Өте қанағаттанбаған клиент'
            },
            en: {
                5: 'Satisfied customer',
                4: 'Good impression',
                3: 'Neutral customer',
                2: 'Dissatisfied customer',
                1: 'Very dissatisfied customer'
            }
        };
        
        const customerStatus = ratingLabels[currentLang][review.rating] || ratingLabels[currentLang][5];
        
        // Перевод текста отзыва если нужно
        let reviewText = review.reviewText;
        let customerName = review.customerName;
        
        if (currentLang === 'en') {
            if (review.reviewText) {
                reviewText = await translateText(review.reviewText, 'en');
            }
            // Имена НЕ переводим - только транслитерируем
            if (review.customerName) {
                customerName = transliterateKazakhToLatin(review.customerName);
            }
        }
        
        // Фото или дефолтное изображение
        const photoUrl = review.photoUrl || 'image/default-avatar.svg';
        
        slide.innerHTML = `
            <i class="fas fa-quote-left"></i>
            <i class="fas fa-quote-right"></i>
            <img src="${photoUrl}" alt="${customerName}" onerror="this.src='image/default-avatar.svg'">
            <div class="stars">
                ${starsHTML}
            </div>
            <p>${reviewText}</p>
            <h3>${customerName}</h3>
            <span>${customerStatus}</span>
        `;
        
        swiperWrapper.appendChild(slide);
    }
    
    // Обновить Swiper
    if (typeof Swiper !== 'undefined') {
        const swiperElement = document.querySelector('.review-slider');
        const reviewSwiper = swiperElement?.swiper;
        
        if (reviewSwiper) {
            reviewSwiper.update();
            reviewSwiper.slideTo(0);
            console.log('✅ Swiper обновлен с переводом, всего слайдов:', reviewSwiper.slides.length);
        }
    }
}

// Переопределяем loadApprovedReviews для кэширования
const originalLoadApprovedReviews = loadApprovedReviews;
window.loadApprovedReviews = async function() {
    try {
        const result = await ReviewsAPI.getApprovedReviews();
        
        if (result.success && result.reviews.length > 0) {
            cachedReviews = result.reviews;
            await updateReviewSliderWithTranslation(cachedReviews);
        }
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
    }
};

// Слушатель смены языка
if (window.i18n) {
    const originalSetLanguage = window.i18n.setLanguage;
    window.i18n.setLanguage = function(lang) {
        originalSetLanguage.call(this, lang);
        
        // Перезагружаем отзывы с новым языком
        if (cachedReviews.length > 0) {
            console.log('🔄 Перезагружаю отзывы для языка:', lang);
            updateReviewSliderWithTranslation(cachedReviews);
        }
    };
}

console.log('✅ Translation support для отзывов готов');
