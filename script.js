const avatarUpload = document.getElementById('avatar-upload');
const cropperContainer = document.getElementById('cropper-container');
const avatarImg = document.getElementById('avatar');
const frameImg = document.getElementById('frame');
const downloadBtn = document.getElementById('download-btn');
const sharePopup = document.getElementById('share-popup');
const closePopupBtn = document.getElementById('close-popup');
const shareTwitterBtn = document.getElementById('share-twitter');
const shareInstagramBtn = document.getElementById('share-instagram');

let cropper;
let imageDataURL; // لتخزين رابط الصورة المحفوظة

// مفتاح API الخاص بـ ImgBB
const IMGBB_API_KEY = 'c01ed5e11fbb000f330510838d5e9500'; // استبدل هذا بمفتاح API الخاص بك

// عند تحميل صورة الأفتار
avatarUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // إظهار الصورة في Cropper.js
            if (cropper) {
                cropper.destroy(); // إعادة تعيين Cropper إذا كان موجودًا
            }
            avatarImg.src = e.target.result;
            avatarImg.style.display = 'block';
            cropperContainer.innerHTML = '<img id="cropper-img" src="' + e.target.result + '">';
            const cropperImg = document.getElementById('cropper-img');
            cropper = new Cropper(cropperImg, {
                aspectRatio: 1, // نسبة القص 1:1 (مربع)
                viewMode: 1,
                autoCropArea: 1, // تغطية أكبر مساحة ممكنة
                guides: false,
                background: false, // إزالة الخلفية السوداء
                ready() {
                    downloadBtn.disabled = false; // تفعيل زر الحفظ
                    // جعل منطقة القص بنفس حجم الحاوية
                    const cropBox = cropper.getCropBoxData();
                    cropBox.width = 400; // عرض منطقة القص (يجب أن يتطابق مع عرض .cropper-container)
                    cropBox.height = 400; // ارتفاع منطقة القص (يجب أن يتطابق مع ارتفاع .cropper-container)
                    cropper.setCropBoxData(cropBox);
                },
                crop(event) {
                    // تحديث الصورة في #avatar عند التعديل
                    const canvas = cropper.getCroppedCanvas({
                        width: 300, // عرض الصورة المعروضة (يجب أن يتطابق مع عرض #avatar-container)
                        height: 300, // ارتفاع الصورة المعروضة (يجب أن يتطابق مع ارتفاع #avatar-container)
                        fillColor: '#fff', // لون الخلفية إذا كانت الصورة غير مربعة
                    });
                    avatarImg.src = canvas.toDataURL('image/png');
                }
            });
        };
        reader.readAsDataURL(file);
    }
});

// عند النقر على زر الحفظ
downloadBtn.addEventListener('click', function() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // تعيين أبعاد الكانفاس إلى 1080x1080 بكسل
    canvas.width = 1080;
    canvas.height = 1080;

    // قص الصورة باستخدام Cropper.js
    const croppedCanvas = cropper.getCroppedCanvas({
        width: 1080,
        height: 1080,
        fillColor: '#fff', // لون الخلفية إذا كانت الصورة غير مربعة
    });

    // رسم الصورة بشكل دائري
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
    context.closePath();
    context.clip(); // اقتصاص الصورة بشكل دائري

    // رسم الصورة المقطوعة على الكانفاس
    context.drawImage(croppedCanvas, 0, 0, canvas.width, canvas.height);

    // رسم صورة الإطار بحجم 1080x1080
    const frame = new Image();
    frame.src = frameImg.src;
    frame.onload = function() {
        context.drawImage(frame, 0, 0, canvas.width, canvas.height);

        // تحويل الكانفاس إلى صورة
        imageDataURL = canvas.toDataURL('image/png');

        // تحميل الصورة إلى ImgBB
        uploadImageToImgBB(imageDataURL)
            .then(imageUrl => {
                // إظهار الخلفية ونافذة البوب أب
                document.getElementById('overlay').style.display = 'block';
                sharePopup.style.display = 'block';

                // تفعيل أزرار المشاركة
                shareTwitterBtn.onclick = () => shareOnTwitter(imageUrl);
                shareInstagramBtn.onclick = () => shareOnInstagram(imageUrl);
            })
            .catch(error => {
                console.error('فشل تحميل الصورة:', error);
                alert('حدث خطأ أثناء تحميل الصورة. يرجى المحاولة مرة أخرى.');
            });

        // إنشاء رابط للتحميل
        const link = document.createElement('a');
        link.href = imageDataURL;
        link.download = 'Layalina_avatar'; // اسم الملف
        link.click();
    };
});

// إغلاق النافذة المنبثقة
closePopupBtn.addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'none'; // إخفاء الخلفية
    sharePopup.style.display = 'none'; // إخفاء البوب أب
});

// إغلاق النافذة عند النقر خارجها (اختياري)
document.getElementById('overlay').addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'none'; // إخفاء الخلفية
    sharePopup.style.display = 'none'; // إخفاء البوب أب
});

// تحميل الصورة إلى ImgBB
function uploadImageToImgBB(imageData) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('image', imageData.split(',')[1]); // إرسال الصورة كـ base64

        fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                resolve(data.data.url); // إرجاع رابط الصورة
            } else {
                reject(data.error);
            }
        })
        .catch(error => reject(error));
    });
}

// مشاركة على تويتر مع نص مخصص وسطرين فراغ
function shareOnTwitter(imageUrl) {
    const text = "#مامثلك_ليالي"; // النص الذي تريد إضافته
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}%0A%0A&url=${encodeURIComponent(imageUrl)}`;
    window.open(shareUrl, '_blank');
}

// مشاركة على إنستغرام (لاحظ أن إنستغرام لا يدعم المشاركة المباشرة عبر الرابط)
function shareOnInstagram(imageUrl) {
    const shareUrl = `https://www.instagram.com/`;
    window.open(shareUrl, '_blank');
}