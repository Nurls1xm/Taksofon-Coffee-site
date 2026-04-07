// ===== REVIEWS API (Firebase) =====

const ReviewsAPI = {
    // Создать отзыв (С сохранением фото как Base64 в Firestore)
    async createReview(reviewData, photoFile = null) {
        try {
            let photoUrl = null;
            
            // Конвертировать фото в Base64 если есть
            if (photoFile) {
                photoUrl = await this.convertPhotoToBase64(photoFile);
            }
            
            const review = {
                customerName: reviewData.name,
                phoneNumber: reviewData.phone || null,
                rating: parseInt(reviewData.rating),
                reviewText: reviewData.review,
                photoUrl: photoUrl, // Base64 строка
                status: 'pending', // pending, approved, rejected
                createdAt: firebase.firestore.Timestamp.now(),
                moderatedAt: null,
                moderatedBy: null,
                moderationComment: null
            };
            
            const docRef = await db.collection('reviews').add(review);
            console.log('✅ Отзыв создан:', docRef.id);
            return { success: true, reviewId: docRef.id };
        } catch (error) {
            console.error('❌ Ошибка создания отзыва:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Конвертация фото в Base64 (альтернатива Storage)
    async convertPhotoToBase64(file) {
        return new Promise((resolve, reject) => {
            // Проверка размера (макс 1MB для Base64)
            if (file.size > 1 * 1024 * 1024) {
                reject(new Error('Файл слишком большой! Максимум 1MB'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const base64String = e.target.result;
                console.log('✅ Фото конвертировано в Base64');
                resolve(base64String);
            };
            
            reader.onerror = (error) => {
                console.error('❌ Ошибка чтения файла:', error);
                reject(error);
            };
            
            reader.readAsDataURL(file);
        });
    },
    
    // Старая функция uploadPhoto больше не нужна
    async uploadPhoto(file) {
        console.warn('⚠️ Storage не используется. Фото сохраняется как Base64');
        return await this.convertPhotoToBase64(file);
    },
    
    // Получить одобренные отзывы (для сайта)
    async getApprovedReviews() {
        try {
            const snapshot = await db.collection('reviews')
                .where('status', '==', 'approved')
                .get();
            
            const reviews = [];
            snapshot.forEach(doc => {
                reviews.push({ id: doc.id, ...doc.data() });
            });
            
            // Сортируем на клиенте (чтобы не нужен был индекс)
            reviews.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB - dateA; // Новые первыми
            });
            
            console.log(`✅ Загружено ${reviews.length} одобренных отзывов`);
            
            return { success: true, reviews };
        } catch (error) {
            console.error('❌ Ошибка получения отзывов:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Получить все отзывы (для админки)
    async getAllReviews() {
        try {
            const snapshot = await db.collection('reviews')
                .orderBy('createdAt', 'desc')
                .get();
            
            const reviews = [];
            snapshot.forEach(doc => {
                reviews.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, reviews };
        } catch (error) {
            console.error('❌ Ошибка получения отзывов:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Получить отзывы по статусу
    async getReviewsByStatus(status) {
        try {
            const snapshot = await db.collection('reviews')
                .where('status', '==', status)
                .orderBy('createdAt', 'desc')
                .get();
            
            const reviews = [];
            snapshot.forEach(doc => {
                reviews.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, reviews };
        } catch (error) {
            console.error('❌ Ошибка получения отзывов:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Одобрить отзыв
    async approveReview(reviewId, adminName) {
        try {
            await db.collection('reviews').doc(reviewId).update({
                status: 'approved',
                moderatedAt: firebase.firestore.Timestamp.now(),
                moderatedBy: adminName
            });
            console.log('✅ Отзыв одобрен');
            return { success: true };
        } catch (error) {
            console.error('❌ Ошибка одобрения отзыва:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Отклонить отзыв
    async rejectReview(reviewId, adminName, comment = null) {
        try {
            await db.collection('reviews').doc(reviewId).update({
                status: 'rejected',
                moderatedAt: firebase.firestore.Timestamp.now(),
                moderatedBy: adminName,
                moderationComment: comment
            });
            console.log('✅ Отзыв отклонен');
            return { success: true };
        } catch (error) {
            console.error('❌ Ошибка отклонения отзыва:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Удалить отзыв (БЕЗ Storage)
    async deleteReview(reviewId) {
        try {
            // Удалить отзыв
            await db.collection('reviews').doc(reviewId).delete();
            console.log('✅ Отзыв удален');
            return { success: true };
        } catch (error) {
            console.error('❌ Ошибка удаления отзыва:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Получить статистику отзывов
    async getReviewsStats() {
        try {
            const snapshot = await db.collection('reviews').get();
            let totalReviews = 0;
            let statusCounts = { pending: 0, approved: 0, rejected: 0 };
            let ratingSum = 0;
            let ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            
            snapshot.forEach(doc => {
                const review = doc.data();
                totalReviews++;
                statusCounts[review.status] = (statusCounts[review.status] || 0) + 1;
                ratingSum += review.rating;
                ratingCounts[review.rating]++;
            });
            
            const averageRating = totalReviews > 0 ? (ratingSum / totalReviews).toFixed(1) : 0;
            
            return {
                success: true,
                stats: {
                    totalReviews,
                    statusCounts,
                    averageRating,
                    ratingCounts
                }
            };
        } catch (error) {
            console.error('❌ Ошибка получения статистики:', error);
            return { success: false, error: error.message };
        }
    }
};

console.log('✅ Reviews API готов');
