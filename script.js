const avatarUpload = document.getElementById('avatar-upload');
const cropperContainer = document.getElementById('cropper-container');
const avatarImg = document.getElementById('avatar');
const frameImg = document.getElementById('frame');
const downloadBtn = document.getElementById('download-btn');
const sharePopup = document.getElementById('share-popup');

let cropper;

// عند تحميل صورة الأفتار
avatarUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (cropper) {
                cropper.destroy();
            }
            avatarImg.src = e.target.result;
            avatarImg.style.display = 'block';
            cropperContainer.innerHTML = '<img id="cropper-img" src="' + e.target.result + '">';
            const cropperImg = document.getElementById('cropper-img');
            cropper = new Cropper(cropperImg, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1,
                guides: false,
                background: false,
                ready() {
                    downloadBtn.disabled = false;
                    const cropBox = cropper.getCropBoxData();
                    cropBox.width = 400;
                    cropBox.height = 400;
                    cropper.setCropBoxData(cropBox);
                },
                crop(event) {
                    const canvas = cropper.getCroppedCanvas({
                        width: 300,
                        height: 300,
                        fillColor: '#fff',
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

    canvas.width = 1080;
    canvas.height = 1080;

    const croppedCanvas = cropper.getCroppedCanvas({
        width: 1080,
        height: 1080,
        fillColor: '#fff',
    });

    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
    context.closePath();
    context.clip();

    context.drawImage(croppedCanvas, 0, 0, canvas.width, canvas.height);

    const frame = new Image();
    frame.src = frameImg.src;
    frame.onload = function() {
        context.drawImage(frame, 0, 0, canvas.width, canvas.height);

        const dataURL = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'Layalina_avatar';
        link.click();

        // إظهار نافذة المشاركة بعد الحفظ
        sharePopup.style.display = 'block';
    };
});

// وظائف المشاركة
function shareOnTwitter() {
    const text = encodeURIComponent('#مامثلك_ليالي');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function shareOnInstagram() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.instagram.com/`, '_blank');
}

function closeSharePopup() {
    sharePopup.style.display = 'none';
}
