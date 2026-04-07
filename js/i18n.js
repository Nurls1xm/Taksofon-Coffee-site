// 🌍 Толық көп тілді қолдау (Full Internationalization)
// Қазақша және English - БАРЛЫҚ САЙТ

const translations = {
    kk: {
        // === НАВИГАЦИЯ ===
        nav_home: "Басты бет",
        nav_about: "Біз туралы",
        nav_menu: "Мәзір",
        nav_review: "Пікірлер",
        nav_book: "Тапсырыс",
        nav_cart: "Себет",
        
        // === БАСТЫ БЕТ ===
        home_title: "Таңертең тамаша кофе",
        
        // === БІЗ ТУРАЛЫ ===
        about_heading: "Біз туралы",
        about_heading_span: "Неліктен бізді таңдау керек?",
        about_title: "Біздің кофені ерекше ететін не?",
        about_description: "Біз тек ең жоғары сапалы кофе дәндерін пайдаланамыз және әрбір кесені махаббатпен дайындаймыз. Біздің кәсіби бариста командасы сізге ең жақсы дәмді ұсынуға дайын. Біз әрбір клиентіміздің қанағаттануына ерекше назар аударамыз.",
        about_read_more: "Толығырақ оқу",
        about_quality: "Сапалы кофе",
        about_branches: "Біздің филиалдар",
        about_order: "Кофе тапсырыс беру",
        
        // === МӘЗІР ===
        menu_heading: "Біздің мәзір",
        menu_heading_span: "Танымал мәзір",
        menu_coffee: "Кофе",
        menu_tea: "Шай",
        menu_cold: "Суық сусындар",
        menu_other: "Басқа сусындар",
        
        // Кофе сипаттамалары
        coffee_latte: "Латте",
        coffee_latte_desc: "Классикалық эспрессо мен ыстық көбіктендірілген сүттен жасалған, үстіне кішкентай сүт көбігі салынған кофе сусыны.",
        coffee_raf: "Раф",
        coffee_raf_desc: "Эспрессо, қою кілегей және ванильді қанттың қоспасы біртекті кілегейлі массаға дейін араластырылған.",
        coffee_flatwhite: "Флэт уайт",
        coffee_flatwhite_desc: "Қос эспрессо мен жібектей сүтті көбіктің жұқа қабатының арқасында бай кофе дәмін беретін \"жалпақ ақ\" кофе.",
        coffee_mocha: "Моккачино",
        coffee_mocha_desc: "Шоколадты мокка тәтті дәм сүйетіндерге.",
        coffee_americano: "Американо",
        coffee_americano_desc: "Эспрессоны ыстық сумен сұйылту арқылы жасалған классикалық кофе сусыны, оның дәмін эспрессоға қарағанда жұмсақ және аз концентрлі етеді.",
        coffee_cappuccino: "Каппучино",
        coffee_cappuccino_desc: "Жұмсақ дәмі бар кремді капучино сүтпен.",
        
        // Шай сипаттамалары
        tea_seabuckthorn: "Облепихалы шай",
        tea_seabuckthorn_desc: "Дәрумендерге бай облепиха жидектерімен дайындалған пайдалы және дәмді шай. Иммунитетті нығайтады.",
        tea_berry: "Жидекті шай",
        tea_berry_desc: "Таза жидектердің қоспасынан жасалған ароматты шай. Жаз дәмін сыйлайды.",
        tea_morocco: "Марокко шайы",
        tea_morocco_desc: "Жалбыз бен дәстүрлі дәмдеуіштермен дайындалған экзотикалық шай. Шығыс дәмі.",
        tea_ginger: "Имбирлі шай",
        tea_ginger_desc: "Жаңа имбирмен дайындалған қыздырушы шай. Суық күндерге тамаша таңдау.",
        tea_gluhwein: "Глинтвейн шай",
        tea_gluhwein_desc: "Дәмдеуіштер мен жылы хош иісті дәстүрлі глинтвейн рецептімен дайындалған шай.",
        tea_karak: "Карак шай",
        tea_karak_desc: "Бұл Араб түбегі елдерінен әкелінген күшті, хош иісті сусын, ол араб қонақжайлылығының көрінісі болып табылады және өзінің ащы ноталарымен жанды жылытады.",
        
        // Суық сусындар
        cold_watermelon_mojito: "Лимонад Қарбыз-Мохито",
        cold_watermelon_mojito_desc: "Жазғы қарбыз бен жалбыздың сергітетін қоспасы.",
        cold_mango_passion: "Лимонад Манго-Маракуйя",
        cold_mango_passion_desc: "Экзотикалық манго мен маракуйяның тропикалық дәмі.",
        cold_cherry_thyme: "Лимонад Шие-Шабдалы",
        cold_cherry_thyme_desc: "Шие мен шабдалының жеңіл және сергітетін дәмі.",
        cold_vanilla_plombir: "Ванильді пломбир",
        cold_vanilla_plombir_desc: "Классикалық ванильді пломбир милкшейк.",
        cold_chocolate_plombir: "Шоколадты пломбир",
        cold_chocolate_plombir_desc: "Бай шоколадты дәмі бар пломбир милкшейк.",
        cold_banana_pudding: "Бананды пудинг",
        cold_banana_pudding_desc: "Кремді банан дәмі бар милкшейк.",
        
        // Басқа сусындар
        other_cocoa: "Какао",
        other_cocoa_desc: "Классикалық ыстық какао сүтпен.",
        other_matcha_latte: "Матча латте",
        other_matcha_latte_desc: "Жапон матча шайы мен сүттің үйлесімі.",
        other_hot_chocolate: "Ыстық шоколад",
        other_hot_chocolate_desc: "Бай және кремді ыстық шоколад.",
        other_matcha_sakura: "Матча Сакура",
        other_matcha_sakura_desc: "Матча мен сакураның нәзік дәмі.",
        
        // === ПІКІРЛЕР ===
        review_heading: "Пікірлер",
        review_heading_span: "Адамдар не дейді?",
        review_form_title: "Өз пікіріңізді қалдырыңыз",
        review_form_subtitle: "Біз сіздің пікіріңізді бағалаймыз!",
        review_name_label: "Аты-жөні",
        review_name_placeholder: "Мысалы: Айдос Нұрлан",
        review_phone_label: "Телефон (қалауыңызша)",
        review_phone_placeholder: "+7 (___) ___-__-__",
        review_rating_label: "Бағалау",
        review_rating_text: "Жұлдызды басып бағалаңыз",
        review_text_label: "Пікір",
        review_text_placeholder: "Біздің қызмет туралы не ойлайсыз? Не ұнады?",
        review_photo_label: "Сурет қосу (қалауыңызша)",
        review_photo_upload: "Сурет таңдаңыз немесе осында апарыңыз",
        review_photo_format: "JPG, PNG немесе JPEG (ең көбі 1MB)",
        review_submit: "Пікір жіберу",
        review_note: "Пікіріңіз модерациядан өткеннен кейін сайтта көрсетіледі",
        
        // Успешный отзыв
        review_success_title: "Рахмет!",
        review_success_message: "Пікіріңіз қабылданды",
        review_success_note: "Модерациядан өткеннен кейін сайтта көрсетіледі",
        
        // Состояние загрузки
        review_submitting: "Жіберілуде...",
        order_submitting: "Тапсырыс жіберілуде...",
        
        // Рейтинг легендасы
        rating_legend_title: "Бағалау шкаласы",
        rating_5: "Қанағаттанған клиент",
        rating_4: "Жақсы әсер алған клиент",
        rating_3: "Бейтарап клиент",
        rating_2: "Қанағаттанбаған клиент",
        rating_1: "Өте қанағаттанбаған клиент",
        
        // === ТАПСЫРЫС ===
        order_heading: "Тапсырыс беру",
        order_heading_span: "Өз сусыныңызды таңдаңыз",
        order_category_coffee: "Кофе",
        order_category_tea: "Шай",
        order_category_cold: "Суық сусындар",
        order_category_other: "Басқа сусындар",
        order_select_coffee: "Кофе түрін таңдаңыз",
        order_select_tea: "Шай түрін таңдаңыз",
        order_select_cold: "Суық сусын таңдаңыз",
        order_select_other: "Басқа сусындар",
        
        // === СЕБЕТ ===
        cart_title: "Себет",
        cart_empty: "Себет бос",
        cart_empty_hint: "Тапсырыс беру үшін сусын таңдаңыз",
        cart_items: "Тауарлар",
        cart_total: "Жалпы сома:",
        cart_checkout: "Тапсырысты рәсімдеу",
        
        // === ТАПСЫРЫС ФОРМАСЫ ===
        checkout_title: "Тапсырысты рәсімдеу",
        checkout_phone: "Телефон номері",
        checkout_phone_placeholder: "+7 (___) ___-__-__",
        checkout_name: "Аты-жөні",
        checkout_name_placeholder: "Мысалы: Айдос Нұрлан",
        checkout_delivery_type: "Жеткізу түрі",
        checkout_delivery: "Жеткізу",
        checkout_pickup: "Өзім аламын",
        checkout_address: "Мекенжай",
        checkout_address_placeholder: "Көше, үй, пәтер",
        checkout_address_comment: "Қосымша ақпарат (подъезд, этаж, домофон...)",
        checkout_payment_method: "Төлем түрі",
        checkout_payment_cash: "Қолма-қол ақша",
        checkout_payment_card: "Картамен",
        checkout_order_summary: "Тапсырыс",
        checkout_items: "Тауарлар:",
        checkout_delivery_fee: "Жеткізу:",
        checkout_total: "Жалпы:",
        checkout_submit: "Тапсырысты растау",
        checkout_payment: "Төлем түрі",
        checkout_payment_cash: "Қолма-қол ақша",
        checkout_payment_card: "Картамен",
        checkout_payment_kaspi: "Kaspi QR",
        
        // === МОДАЛЬНОЕ ОКНО ЗАКАЗА ===
        modal_choose_size: "Көлемін таңдаңыз",
        modal_size_small: "Кішкентай",
        modal_size_medium: "Орташа",
        modal_size_large: "Үлкен",
        modal_ml: "мл",
        modal_popular: "Танымал",
        modal_alt_milk: "Балама сүт",
        modal_optional: "(қалауыңызша)",
        modal_free: "тегін",
        modal_milk_coconut: "Кокос сүті",
        modal_milk_almond: "Бадам сүті",
        modal_milk_hazelnut: "Жаңғақ сүті",
        modal_milk_oat: "Сұлы сүті",
        modal_syrups: "Сироптар",
        modal_syrup_caramel: "Карамель",
        modal_syrup_salted_caramel: "Тұзды карамель",
        modal_syrup_vanilla: "Ваниль",
        modal_syrup_coconut: "Кокос",
        modal_syrup_popcorn: "Попкорн",
        modal_syrup_irish: "Айриш крим",
        modal_sugar: "Қант",
        modal_sugar_regular: "Қант",
        modal_sugar_sweetener: "Қант алмастырғыш",
        modal_sugar_none: "Қантсыз",
        modal_quantity: "Саны",
        modal_comment: "Пікір",
        modal_comment_placeholder: "Мысалы: кофені күштірек жасаңыз, қантты көбірек қосыңыз, сиропты аз қосыңыз...",
        
        // Хабарлама
        book_notification_title: "Хабарлама түрі",
        book_notification_subtitle: "Тапсырыс дайын болғанда қалай хабарласамыз?",
        book_notification_telegram: "Telegram",
        book_notification_telegram_desc: "Лездік хабарлама",
        book_notification_email_desc: "Электронды пошта",
        book_notification_push_desc: "Push хабарлама",
        book_notification_none_desc: "Өзім тексеремін",
        book_notification_email: "Email",
        book_notification_push: "Браузер хабарламасы",
        book_notification_none: "Хабарлама керек емес",
        book_telegram_placeholder: "@username немесе chat ID",
        book_email_placeholder: "example@mail.com",
        
        // Карта деректері
        card_details_title: "Карта деректері",
        card_number: "Карта номері",
        card_number_placeholder: "0000 0000 0000 0000",
        card_holder: "Карта иесінің аты",
        card_holder_placeholder: "AIDYN NURLAN",
        card_expiry: "Жарамдылық мерзімі",
        card_expiry_placeholder: "MM/YY",
        card_cvv: "CVV",
        card_cvv_placeholder: "•••",
        card_security: "Сіздің деректеріңіз қауіпсіз SSL шифрлауымен қорғалған",
        
        // Kaspi QR
        kaspi_title: "Kaspi QR арқылы төлеу",
        kaspi_steps_title: "Төлеу қадамдары:",
        kaspi_step1: "Kaspi.kz қосымшасын ашыңыз",
        kaspi_step2: "\"Төлеу\" бөліміне өтіңіз",
        kaspi_step3: "QR кодты сканерлеңіз",
        kaspi_step4: "Төлемді растаңыз",
        kaspi_note: "Тапсырысты растағаннан кейін, QR код арқылы төлем жасаңыз. Төлем туралы менеджер сізге хабарласады.",
        
        // Қорытынды
        summary_title: "Тапсырыс қорытындысы",
        summary_items: "Тауарлар:",
        summary_delivery: "Жеткізу:",
        summary_total: "Жалпы:",
        summary_free: "Тегін",
        
        // Батырмалар
        btn_submit_order: "Тапсырысты растау",
        btn_cancel: "Болдырмау",
        btn_close: "Жабу",
        btn_add_to_cart: "Себетке қосу",
        
        // === ФУТЕР ===
        footer_quick_links: "Жылдам сілтемелер",
        footer_contact: "Байланыс ақпараты",
        footer_social: "Әлеуметтік желілер",
        footer_location: "Қазақстан, Астана",
        footer_credit: "Жасаған",
        footer_designer: "веб-дизайнер",
        footer_rights: "барлық құқықтар қорғалған",
        
        // === МОДАЛ (Кофе таңдау) ===
        modal_select_size: "Көлемін таңдаңыз",
        modal_size_small: "Кішкентай",
        modal_size_medium: "Орташа",
        modal_size_large: "Үлкен",
        modal_popular: "Танымал",
        modal_alt_milk: "Балама сүт",
        modal_optional: "(қалауыңызша",
        modal_syrups: "Сироптар",
        modal_sugar: "Қант",
        modal_sugar_regular: "Қант",
        modal_sugar_sweetener: "Қант алмастырғыш",
        modal_sugar_none: "Қантсыз",
        modal_quantity: "Саны",
        modal_comment: "Пікір",
        modal_comment_placeholder: "Мысалы: кофені күштірек жасаңыз, қантты көбірек қосыңыз...",
        modal_total: "Жалпы:",
        
        // === ХАБАРЛАМАЛАР (УВЕДОМЛЕНИЯ) ===
        notification_added: "Қосылды!",
        notification_added_to_cart: "Себетке қосылды!",
        
        // Push уведомления статусы
        push_permission_granted: "Рұқсат берілді!",
        push_notifications_enabled: "Хабарламалар қосылды!",
        push_permission_denied: "Рұқсат берілмеді",
        push_browser_request: "Браузер рұқсат сұрайды",
        push_enabled_button: "Қосылды",
        
        // Сүт түрлері
        milk_coconut: "Кокос сүті",
        milk_almond: "Бадам сүті",
        milk_hazelnut: "Жаңғақ сүті",
        milk_oat: "Сұлы сүті",
        
        // Сироптар
        syrup_caramel: "Карамель",
        syrup_salted_caramel: "Тұзды карамель",
        syrup_vanilla: "Ваниль",
        syrup_coconut: "Кокос",
        syrup_popcorn: "Попкорн",
        syrup_irish_cream: "Айриш крим",
        
        // === ХАБАРЛАМАЛАР ===
        notification_order_created: "Тапсырыс жасалды!",
        notification_order_number: "Тапсырыс нөмірі",
        notification_verification_code: "Тексеру коды",
        notification_track_order: "Тапсырысты бақылау",
        notification_error: "Қате орын алды",
        notification_fill_fields: "Барлық өрістерді толтырыңыз",
        notification_select_items: "Өнімдерді таңдаңыз",
        notification_success: "Сәтті!",
        
        // === КАРТА ҚАТЕЛЕРІ ===
        card_number_invalid: "Карта нөмірі дұрыс емес (16 сан болуы керек)",
        card_expiry_invalid: "Жарамдылық мерзімі дұрыс емес (MM/YY форматы)",
        card_month_invalid: "Ай дұрыс емес (01-12)",
        card_expired: "Карта мерзімі өтіп кетті",
        card_cvv_invalid: "CVV коды дұрыс емес (3 сан)",
        card_holder_invalid: "Карта иесінің аты дұрыс емес",
        
        // === ТАПСЫРЫС ДИСПЛЕЙІ ===
        order_display_heading: "Дайын тапсырыстар",
        order_display_heading_span: "Тапсырыс нөміріңізді тексеріңіз",
        nav_order_display: "Дайын тапсырыстар",
        ready_orders_title: "Алуға дайын",
        preparing_orders_title: "Дайындалуда",
        no_ready_orders: "Дайын тапсырыстар жоқ",
        orders_will_appear: "Дайын болғанда тапсырыстар осында көрсетіледі",
        no_preparing_orders: "Дайындалып жатқан тапсырыстар жоқ",
        
        // === ТАПСЫРЫС СӘТТІ МОДАЛЫ ===
        order_success_title: "Тапсырыс қабылданды",
        order_success_number: "Тапсырыс нөмірі",
        order_success_phone: "Телефон",
        order_success_name: "Аты-жөні",
        order_success_delivery: "Жеткізу",
        order_success_payment: "Төлем",
        order_success_total: "Жалпы сома",
        order_success_message: "Жақын арада біздің менеджер сізге хабарласып, тапсырысты растайды. Рахмет! ☕",
        order_success_ok: "Жақсы",
        
        // === ЧЕК (RECEIPT) ===
        receipt_date: "Күні:",
        receipt_customer: "Тапсырыс беруші:",
        receipt_phone: "Телефон:",
        receipt_delivery: "Жеткізу:",
        receipt_payment: "Төлем:",
        receipt_order_number: "ТАПСЫРЫС НӨМІРІ",
        receipt_track_instruction: "Бұл нөмірді \"Дайын тапсырыстар\" бөлімінде тексеріңіз",
        receipt_status_new: "Жаңа тапсырыс",
        receipt_status_confirmed: "Расталды",
        receipt_status_preparing: "Дайындалуда",
        receipt_status_ready: "Дайын",
        receipt_items: "ТАПСЫРЫС:",
        receipt_total: "ЖАЛПЫ:",
        receipt_thank_you: "Рахмет! Сіздің тапсырысыңыз қабылданды",
        receipt_contact: "Сұрақтар бойынша: +7 (701) 250-57-77",
        receipt_check_display: "Дисплейді тексеру",
        receipt_print: "Басып шығару",
        receipt_close: "Жабу",
        
        // === ORDER TRACKING ===
        order_tracking_title: "Тапсырысты бақылау",
        order_tracking_number: "Тапсырыс нөмірі",
        order_tracking_number_placeholder: "Мысалы: 1734785520123",
        order_tracking_code: "Тексеру коды",
        order_tracking_code_placeholder: "Мысалы: B7K4",
        order_tracking_check: "🔍 Тапсырысты тексеру",
        
        // === ӨЛШЕМ БІРЛІКТЕРІ ===
        unit_ml: "мл",
        unit_pcs: "дана",
        
        // === ҚОСЫМША ===
        currency: "₸",
        loading: "Жүктелуде...",
        required: "*"
    },
    
    en: {
        // === NAVIGATION ===
        nav_home: "Home",
        nav_about: "About",
        nav_menu: "Menu",
        nav_review: "Reviews",
        nav_book: "Order",
        nav_cart: "Cart",
        
        // === HOME ===
        home_title: "Great morning coffee",
        
        // === ABOUT ===
        about_heading: "About Us",
        about_heading_span: "Why choose us?",
        about_title: "What makes our coffee special?",
        about_description: "We use only the highest quality coffee beans and prepare each cup with love. Our professional barista team is ready to offer you the best taste. We pay special attention to the satisfaction of each of our clients.",
        about_read_more: "Read More",
        about_quality: "Quality Coffee",
        about_branches: "Our Branches",
        about_order: "Order Coffee",
        
        // === MENU ===
        menu_heading: "Our Menu",
        menu_heading_span: "Popular Menu",
        menu_coffee: "Coffee",
        menu_tea: "Tea",
        menu_cold: "Cold Drinks",
        menu_other: "Other Drinks",
        
        // Coffee descriptions
        coffee_latte: "Latte",
        coffee_latte_desc: "A coffee drink made from classic espresso and hot frothed milk, topped with a small amount of milk foam.",
        coffee_raf: "Raf",
        coffee_raf_desc: "A mixture of espresso, heavy cream and vanilla sugar whipped into a homogeneous creamy mass.",
        coffee_flatwhite: "Flat White",
        coffee_flatwhite_desc: "\"Flat white\" coffee that gives a rich coffee taste thanks to a double espresso and a thin layer of silky milk foam.",
        coffee_mocha: "Mocha",
        coffee_mocha_desc: "Chocolate mocha for those with a sweet tooth.",
        coffee_americano: "Americano",
        coffee_americano_desc: "A classic coffee drink made by diluting espresso with hot water, making its taste softer and less concentrated than espresso.",
        coffee_cappuccino: "Cappuccino",
        coffee_cappuccino_desc: "Creamy cappuccino with milk with a soft taste.",
        
        // Tea descriptions
        tea_seabuckthorn: "Sea Buckthorn Tea",
        tea_seabuckthorn_desc: "Healthy and tasty tea prepared with vitamin-rich sea buckthorn berries. Strengthens immunity.",
        tea_berry: "Berry Tea",
        tea_berry_desc: "Aromatic tea made from a mixture of fresh berries. Gives the taste of summer.",
        tea_morocco: "Moroccan Tea",
        tea_morocco_desc: "Exotic tea prepared with mint and traditional seasonings. Taste of the East.",
        tea_ginger: "Ginger Tea",
        tea_ginger_desc: "Warming tea prepared with fresh ginger. Great choice for cold days.",
        tea_gluhwein: "Gluhwein Tea",
        tea_gluhwein_desc: "Tea prepared according to the traditional gluhwein recipe with spices and warm aroma.",
        tea_karak: "Karak Tea",
        tea_karak_desc: "This strong, aromatic drink brought from the Arabian Peninsula is a manifestation of Arab hospitality and warms the soul with its bitter notes.",
        
        // Cold drinks
        cold_watermelon_mojito: "Watermelon-Mojito Lemonade",
        cold_watermelon_mojito_desc: "Refreshing blend of summer watermelon and mint.",
        cold_mango_passion: "Mango-Passion Fruit Lemonade",
        cold_mango_passion_desc: "Tropical taste of exotic mango and passion fruit.",
        cold_cherry_thyme: "Cherry-Thyme Lemonade",
        cold_cherry_thyme_desc: "Light and refreshing taste of cherry and thyme.",
        cold_vanilla_plombir: "Vanilla Plombir",
        cold_vanilla_plombir_desc: "Classic vanilla plombir milkshake.",
        cold_chocolate_plombir: "Chocolate Plombir",
        cold_chocolate_plombir_desc: "Plombir milkshake with rich chocolate taste.",
        cold_banana_pudding: "Banana Pudding",
        cold_banana_pudding_desc: "Milkshake with creamy banana flavor.",
        
        // Other drinks
        other_cocoa: "Cocoa",
        other_cocoa_desc: "Classic hot cocoa with milk.",
        other_matcha_latte: "Matcha Latte",
        other_matcha_latte_desc: "Combination of Japanese matcha tea and milk.",
        other_hot_chocolate: "Hot Chocolate",
        other_hot_chocolate_desc: "Rich and creamy hot chocolate.",
        other_matcha_sakura: "Matcha Sakura",
        other_matcha_sakura_desc: "Delicate taste of matcha and sakura.",
        
        // === REVIEWS ===
        review_heading: "Reviews",
        review_heading_span: "What people say?",
        review_form_title: "Leave your review",
        review_form_subtitle: "We appreciate your feedback!",
        review_name_label: "Name",
        review_name_placeholder: "e.g. John Smith",
        review_phone_label: "Phone (optional)",
        review_phone_placeholder: "+7 (___) ___-__-__",
        review_rating_label: "Rating",
        review_rating_text: "Click on a star to rate",
        review_text_label: "Review",
        review_text_placeholder: "What do you think about our service? What did you like?",
        review_photo_label: "Add photo (optional)",
        review_photo_upload: "Choose photo or drag it here",
        review_photo_format: "JPG, PNG or JPEG (max 1MB)",
        review_submit: "Submit Review",
        review_note: "Your review will be displayed on the site after moderation",
        
        // Review success
        review_success_title: "Thank you!",
        review_success_message: "Your review has been received",
        review_success_note: "It will be displayed on the site after moderation",
        
        // Loading state
        review_submitting: "Submitting...",
        order_submitting: "Submitting order...",
        
        // Rating legend
        rating_legend_title: "Rating Scale",
        rating_5: "Satisfied customer",
        rating_4: "Good impression",
        rating_3: "Neutral customer",
        rating_2: "Dissatisfied customer",
        rating_1: "Very dissatisfied customer",
        
        // === ORDER ===
        order_heading: "Place Order",
        order_heading_span: "Choose your drink",
        order_category_coffee: "Coffee",
        order_category_tea: "Tea",
        order_category_cold: "Cold Drinks",
        order_category_other: "Other Drinks",
        order_select_coffee: "Choose coffee type",
        order_select_tea: "Choose tea type",
        order_select_cold: "Choose cold drink",
        order_select_other: "Other drinks",
        
        // === CART ===
        cart_title: "Cart",
        cart_empty: "Cart is empty",
        cart_empty_hint: "Choose a drink to place an order",
        cart_items: "Items",
        cart_total: "Total:",
        cart_checkout: "Checkout",
        
        // === CHECKOUT FORM ===
        checkout_title: "Checkout",
        checkout_phone: "Phone Number",
        checkout_phone_placeholder: "+7 (___) ___-__-__",
        checkout_name: "Full Name",
        checkout_name_placeholder: "e.g. John Smith",
        checkout_delivery_type: "Delivery Type",
        checkout_delivery: "Delivery",
        checkout_pickup: "Pickup",
        checkout_address: "Address",
        checkout_address_placeholder: "Street, building, apartment",
        checkout_address_comment: "Additional info (entrance, floor, intercom...)",
        checkout_payment_method: "Payment Method",
        checkout_payment: "Payment Method",
        checkout_payment_cash: "Cash",
        checkout_payment_card: "Card",
        checkout_payment_kaspi: "Kaspi QR",
        checkout_order_summary: "Order",
        checkout_items: "Items:",
        checkout_delivery_fee: "Delivery:",
        checkout_total: "Total:",
        checkout_submit: "Confirm Order",
        
        // === ORDER MODAL ===
        modal_choose_size: "Choose size",
        modal_size_small: "Small",
        modal_size_medium: "Medium",
        modal_size_large: "Large",
        modal_ml: "ml",
        modal_popular: "Popular",
        modal_alt_milk: "Alternative milk",
        modal_optional: "(optional)",
        modal_free: "free",
        modal_milk_coconut: "Coconut milk",
        modal_milk_almond: "Almond milk",
        modal_milk_hazelnut: "Hazelnut milk",
        modal_milk_oat: "Oat milk",
        modal_syrups: "Syrups",
        modal_syrup_caramel: "Caramel",
        modal_syrup_salted_caramel: "Salted caramel",
        modal_syrup_vanilla: "Vanilla",
        modal_syrup_coconut: "Coconut",
        modal_syrup_popcorn: "Popcorn",
        modal_syrup_irish: "Irish cream",
        modal_sugar: "Sugar",
        modal_sugar_regular: "Sugar",
        modal_sugar_sweetener: "Sweetener",
        modal_sugar_none: "No sugar",
        modal_quantity: "Quantity",
        modal_comment: "Comment",
        modal_comment_placeholder: "e.g. make coffee stronger, add more sugar, less syrup...",
        
        // Notification
        checkout_payment_card: "Card",
        checkout_payment_kaspi: "Kaspi QR",
        
        // Notification
        book_notification_title: "Notification Type",
        book_notification_subtitle: "How should we notify you when order is ready?",
        book_notification_telegram: "Telegram",
        book_notification_telegram_desc: "Instant message",
        book_notification_email_desc: "Email notification",
        book_notification_push_desc: "Push notification",
        book_notification_none_desc: "I'll check myself",
        book_notification_email: "Email",
        book_notification_push: "Browser Notification",
        book_notification_none: "No notification needed",
        book_telegram_placeholder: "@username or chat ID",
        book_email_placeholder: "example@mail.com",
        
        // Card details
        card_details_title: "Card Details",
        card_number: "Card Number",
        card_number_placeholder: "0000 0000 0000 0000",
        card_holder: "Cardholder Name",
        card_holder_placeholder: "JOHN SMITH",
        card_expiry: "Expiry Date",
        card_expiry_placeholder: "MM/YY",
        card_cvv: "CVV",
        card_cvv_placeholder: "•••",
        card_security: "Your data is protected with secure SSL encryption",
        
        // Kaspi QR
        kaspi_title: "Pay with Kaspi QR",
        kaspi_steps_title: "Payment Steps:",
        kaspi_step1: "Open Kaspi.kz app",
        kaspi_step2: "Go to \"Payment\" section",
        kaspi_step3: "Scan QR code",
        kaspi_step4: "Confirm payment",
        kaspi_note: "After confirming the order, make a payment via QR code. The manager will contact you about the payment.",
        
        // Summary
        summary_title: "Order Summary",
        summary_items: "Items:",
        summary_delivery: "Delivery:",
        summary_total: "Total:",
        summary_free: "Free",
        
        // Buttons
        btn_submit_order: "Confirm Order",
        btn_cancel: "Cancel",
        btn_close: "Close",
        btn_add_to_cart: "Add to Cart",
        
        // === FOOTER ===
        footer_quick_links: "Quick Links",
        footer_contact: "Contact Info",
        footer_social: "Social Media",
        footer_location: "Kazakhstan, Astana",
        footer_credit: "Created by",
        footer_designer: "web designer",
        footer_rights: "all rights reserved",
        
        // === MODAL (Coffee Selection) ===
        modal_select_size: "Select Size",
        modal_size_small: "Small",
        modal_size_medium: "Medium",
        modal_size_large: "Large",
        modal_popular: "Popular",
        modal_alt_milk: "Alternative Milk",
        modal_optional: "(optional",
        modal_syrups: "Syrups",
        modal_sugar: "Sugar",
        modal_sugar_regular: "Sugar",
        modal_sugar_sweetener: "Sweetener",
        modal_sugar_none: "No Sugar",
        modal_quantity: "Quantity",
        modal_comment: "Comment",
        modal_comment_placeholder: "e.g. make coffee stronger, add more sugar...",
        modal_total: "Total:",
        
        // === NOTIFICATIONS ===
        notification_added: "Added!",
        notification_added_to_cart: "Added to cart!",
        
        // Push notification status
        push_permission_granted: "Permission granted!",
        push_notifications_enabled: "Notifications enabled!",
        push_permission_denied: "Permission denied",
        push_browser_request: "Browser will request permission",
        push_enabled_button: "Enabled",
        
        // Milk types
        milk_coconut: "Coconut Milk",
        milk_almond: "Almond Milk",
        milk_hazelnut: "Hazelnut Milk",
        milk_oat: "Oat Milk",
        
        // Syrups
        syrup_caramel: "Caramel",
        syrup_salted_caramel: "Salted Caramel",
        syrup_vanilla: "Vanilla",
        syrup_coconut: "Coconut",
        syrup_popcorn: "Popcorn",
        syrup_irish_cream: "Irish Cream",
        
        // === NOTIFICATIONS ===
        notification_order_created: "Order Created!",
        notification_order_number: "Order Number",
        notification_verification_code: "Verification Code",
        notification_track_order: "Track Order",
        notification_error: "An error occurred",
        notification_fill_fields: "Please fill all fields",
        notification_select_items: "Please select items",
        notification_success: "Success!",
        
        // === CARD ERRORS ===
        card_number_invalid: "Invalid card number (must be 16 digits)",
        card_expiry_invalid: "Invalid expiry date (MM/YY format)",
        card_month_invalid: "Invalid month (01-12)",
        card_expired: "Card has expired",
        card_cvv_invalid: "Invalid CVV code (3 digits)",
        card_holder_invalid: "Invalid cardholder name",
        
        // === ORDER DISPLAY ===
        order_display_heading: "Ready Orders",
        order_display_heading_span: "Check Your Order Number",
        nav_order_display: "Ready Orders",
        ready_orders_title: "Ready for Pickup",
        preparing_orders_title: "Being Prepared",
        no_ready_orders: "No Ready Orders",
        orders_will_appear: "Orders will appear here when ready",
        no_preparing_orders: "No orders in preparation",
        
        // === ORDER SUCCESS MODAL ===
        order_success_title: "Order Accepted",
        order_success_number: "Order Number",
        order_success_phone: "Phone",
        order_success_name: "Name",
        order_success_delivery: "Delivery",
        order_success_payment: "Payment",
        order_success_total: "Total Amount",
        order_success_message: "Our manager will contact you shortly to confirm the order. Thank you! ☕",
        order_success_ok: "OK",
        
        // === RECEIPT ===
        receipt_date: "Date:",
        receipt_customer: "Customer:",
        receipt_phone: "Phone:",
        receipt_delivery: "Delivery:",
        receipt_payment: "Payment:",
        receipt_order_number: "ORDER NUMBER",
        receipt_track_instruction: "Check this number in \"Ready Orders\" section",
        receipt_status_new: "New Order",
        receipt_status_confirmed: "Confirmed",
        receipt_status_preparing: "Preparing",
        receipt_status_ready: "Ready",
        receipt_items: "ORDER:",
        receipt_total: "TOTAL:",
        receipt_thank_you: "Thank you! Your order has been accepted",
        receipt_contact: "Questions: +7 (701) 250-57-77",
        receipt_check_display: "Check Display",
        receipt_print: "Print",
        receipt_close: "Close",
        
        // === ORDER TRACKING ===
        order_tracking_title: "Order Tracking",
        order_tracking_number: "Order Number",
        order_tracking_number_placeholder: "e.g. 1734785520123",
        order_tracking_code: "Verification Code",
        order_tracking_code_placeholder: "e.g. B7K4",
        order_tracking_check: "🔍 Check Order",
        
        // === UNITS ===
        unit_ml: "ml",
        unit_pcs: "pcs",
        
        // === ADDITIONAL ===
        currency: "₸",
        loading: "Loading...",
        required: "*"
    }
};

// Ағымдағы тіл
let currentLanguage = localStorage.getItem('language') || 'kk';

// Тілді орнату
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updatePageLanguage();
    
    // HTML lang атрибутын өзгерту
    document.documentElement.lang = lang;
}

// Аударманы алу
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Бетті жаңарту
function updatePageLanguage() {
    // data-i18n атрибуты бар барлық элементтерді табу
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        let translation = t(key);
        
        // Capitalize drink names (coffee, tea, cold drinks, other drinks)
        if (key.startsWith('coffee_') || key.startsWith('tea_') || 
            key.startsWith('cold_') || key.startsWith('other_')) {
            // Only capitalize if it's not a description (doesn't end with _desc)
            if (!key.endsWith('_desc')) {
                translation = translation.charAt(0).toUpperCase() + translation.slice(1);
            }
        }
        
        // Placeholder немесе мәтін
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            // If the key contains 'placeholder', update placeholder
            if (key.includes('placeholder')) {
                element.placeholder = translation;
            } else if (element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else {
                element.value = translation;
            }
        } else {
            element.textContent = translation;
        }
    });
    
    // data-i18n-placeholder атрибуты бар элементтер (placeholder мәтіні)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
    
    // data-i18n-html атрибуты бар элементтер (HTML мазмұны)
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
        const key = element.getAttribute('data-i18n-html');
        element.innerHTML = t(key);
    });
    
    // Тіл ауыстырғыш батырмаларын жаңарту
    document.querySelectorAll('.lang-btn, .navbar-lang-btn, .header-lang-btn').forEach(btn => {
        if (btn.dataset.lang === currentLanguage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update cart if updateCartUI function exists
    if (typeof updateCartUI === 'function') {
        updateCartUI();
    }
    
    // Update modal content if modal is open
    updateOpenModals();
}

// Бет жүктелгенде
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage();
});

// Экспорт
window.i18n = {
    setLanguage,
    t,
    getCurrentLanguage: () => currentLanguage
};

// Экспорт translations для использования в других скриптах
window.translations = translations;

// Функция для обновления открытых модальных окон при смене языка
function updateOpenModals() {
    // Check if drink modal is open
    const drinkModal = document.getElementById('drinkModal');
    if (drinkModal && drinkModal.classList.contains('active')) {
        const modalDrinkName = document.getElementById('modalDrinkName');
        const modalDrinkDesc = document.getElementById('modalDrinkDesc');
        
        // Get current drink type from modal or data attribute
        const currentDrinkType = drinkModal.getAttribute('data-current-drink');
        if (currentDrinkType && typeof getTranslatedDrinkName === 'function') {
            modalDrinkName.textContent = getTranslatedDrinkName(currentDrinkType);
            modalDrinkDesc.textContent = getTranslatedDrinkDesc(currentDrinkType);
        }
    }
    
    // Check if hot drink modal is open
    const hotDrinkModal = document.getElementById('hotDrinkModal');
    if (hotDrinkModal && hotDrinkModal.classList.contains('active')) {
        const modalHotDrinkName = document.getElementById('modalHotDrinkName');
        const modalHotDrinkDesc = document.getElementById('modalHotDrinkDesc');
        
        // Get current drink type from modal or data attribute
        const currentDrinkType = hotDrinkModal.getAttribute('data-current-drink');
        if (currentDrinkType && typeof getTranslatedDrinkName === 'function') {
            modalHotDrinkName.textContent = getTranslatedDrinkName(currentDrinkType);
            modalHotDrinkDesc.textContent = getTranslatedDrinkDesc(currentDrinkType);
        }
    }
    
    // Check if coffee modal is open
    const coffeeModal = document.getElementById('coffeeModal');
    if (coffeeModal && coffeeModal.classList.contains('active')) {
        const modalCoffeeName = document.getElementById('modalCoffeeName');
        const modalCoffeeDesc = document.getElementById('modalCoffeeDesc');
        
        // Get current drink type from modal or data attribute
        const currentDrinkType = coffeeModal.getAttribute('data-current-drink');
        if (currentDrinkType && typeof getTranslatedDrinkName === 'function') {
            modalCoffeeName.textContent = getTranslatedDrinkName(currentDrinkType);
            modalCoffeeDesc.textContent = getTranslatedDrinkDesc(currentDrinkType);
        }
    }
}
