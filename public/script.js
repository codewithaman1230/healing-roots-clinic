// 🟢 Automatic Live Doctor Status Logic
function updateDoctorStatus() {
    const now = new Date();
    const day = now.getDay(); 
    const hour = now.getHours(); 

    const badge = document.getElementById('liveStatusBadge');
    const dot = document.getElementById('pulseDot');
    const text = document.getElementById('statusText');

    if (!badge || !dot || !text) return;

    const isWorkingDays = (day >= 1 && day <= 6);
    const isWorkingHours = (hour >= 9 && hour < 19);

    if (isWorkingDays && isWorkingHours) {
        text.innerText = "Dr. Radhika Online";
        dot.style.backgroundColor = "#34D399";
        badge.style.background = "rgba(255, 255, 255, 0.15)";
    } else {
        text.innerText = "Dr. Radhika Offline";
        dot.style.backgroundColor = "#EF4444";
        badge.style.background = "rgba(239, 68, 68, 0.2)";
    }
}

updateDoctorStatus();
setInterval(updateDoctorStatus, 60000);

// Past Dates Block Logic
const dateInput = document.getElementById('appointmentDate');
if (dateInput) {
    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', todayStr);
}

const form = document.querySelector('.appointment-form');
const modal = document.getElementById('slipModal');

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Safe direct ID targeting
        const fullNameEl = document.getElementById('apptFullName');
        const emailEl = document.getElementById('apptEmail');
        const phoneEl = document.getElementById('apptPhone');
        const serviceEl = document.getElementById('apptService');
        const timeSlotEl = document.getElementById('apptTimeSlot');

        const fullName = fullNameEl ? fullNameEl.value.trim() : '';
        const email = emailEl ? emailEl.value.trim() : '';
        const phone = phoneEl ? phoneEl.value.trim() : '';
        const service = serviceEl ? serviceEl.value : '';
        const date = dateInput ? dateInput.value : '';
        const timeSlot = timeSlotEl ? timeSlotEl.value : '';

        if (!fullName || !phone || !service || !date || !timeSlot) {
            alert('Kripya saari required details (Full Name, Phone Number, Service, Date, Time Slot) bharein!');
            return;
        }

        let appointmentCounter = localStorage.getItem('healingRootsToken') || 101;
        appointmentCounter = parseInt(appointmentCounter) + 1;
        localStorage.setItem('healingRootsToken', appointmentCounter);

        const tokenNumber = `#HR-${appointmentCounter}`;

        let patientDatabase = JSON.parse(localStorage.getItem('healingRootsDB')) || {};
        patientDatabase[phone] = {
            name: fullName,
            token: tokenNumber,
            date: date,
            time: timeSlot,
            service: service
        };
        localStorage.setItem('healingRootsDB', JSON.stringify(patientDatabase));

        const doctorWhatsAppNumber = "918982160554"; 
        const message = `Hello Dr. Radhika,\n\nI want to book an appointment at Healing Roots Clinic.\n\n🎟️ Appointment No: ${tokenNumber}\n\nPatient Details:\n👤 Name: ${fullName}\n📧 Email: ${email || 'N/A'}\n📞 Phone: ${phone}\n🩺 Service: ${service}\n📅 Date: ${date}\n⏰ Time: ${timeSlot}`;

        const whatsappURL = `https://api.whatsapp.com/send?phone=${doctorWhatsAppNumber}&text=${encodeURIComponent(message)}`;

        const modalTokenText = document.getElementById('modalTokenText');
        const modalDetailsText = document.getElementById('modalDetailsText');

        if (modalTokenText) modalTokenText.innerText = tokenNumber;
        if (modalDetailsText) {
            modalDetailsText.innerHTML = `
                <p><b>Name:</b> ${fullName}</p>
                <p><b>Email:</b> ${email || 'N/A'}</p>
                <p><b>Phone:</b> ${phone}</p>
                <p><b>Service:</b> ${service}</p>
                <p><b>Date:</b> ${date}</p>
                <p><b>Time:</b> ${timeSlot}</p>
                <div style="margin-top: 15px;">
                    <a href="${whatsappURL}" target="_blank" class="btn-primary" style="display: block; text-align: center; text-decoration: none;">Open WhatsApp Directly</a>
                </div>
            `;
        }

        // Show confirmation modal
        if (modal) modal.style.display = 'flex';

        form.reset();
        if (dateInput) {
            dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
        }

        // Direct open WhatsApp window
        try {
            window.open(whatsappURL, '_blank');
        } catch (err) {
            console.error('Window open error:', err);
        }
    });
}

function closeModal() {
    if (modal) modal.style.display = 'none';
}

function checkTokenStatus() {
    const searchPhoneInput = document.getElementById('searchPhone');
    const resultDiv = document.getElementById('checkerResult');
    
    if (!searchPhoneInput || !resultDiv) return;
    const searchPhone = searchPhoneInput.value.trim();
    
    if(!searchPhone) {
        resultDiv.style.color = '#DC2626';
        resultDiv.innerText = "Please enter a valid phone number!";
        return;
    }

    let patientDatabase = JSON.parse(localStorage.getItem('healingRootsDB')) || {};
    
    if(patientDatabase[searchPhone]) {
        const data = patientDatabase[searchPhone];
        resultDiv.style.color = '#0E5C36';
        resultDiv.innerHTML = `Found! Patient: <b>${data.name}</b> | Token: <span style="color:#1A56DB;">${data.token}</span> | Date: ${data.date} (${data.time})`;
    } else {
        resultDiv.style.color = '#DC2626';
        resultDiv.innerText = "No active appointment found for this phone number.";
    }
}

// 🔐 Doctor Admin Authentication System
let isDoctorLoggedIn = sessionStorage.getItem('healingRootsDocAuth') === 'true';

function toggleDoctorAuth() {
    if (isDoctorLoggedIn) {
        isDoctorLoggedIn = false;
        sessionStorage.removeItem('healingRootsDocAuth');
        alert("Doctor Portal Logged Out Successfully.");
        location.reload();
    } else {
        const password = prompt("Enter Doctor Admin Password:");
        if (password === "radhika123") {
            isDoctorLoggedIn = true;
            sessionStorage.setItem('healingRootsDocAuth', 'true');
            alert("Welcome Dr. Radhika! Access granted.");
            location.reload();
        } else if (password !== null) {
            alert("Incorrect Password!");
        }
    }
}

function applyDoctorAuthUI() {
    const uploadSection = document.getElementById('doctorUploadSection');
    const adminStatusText = document.getElementById('adminStatusText');
    const adminAuthBtn = document.getElementById('adminAuthBtn');

    if (isDoctorLoggedIn) {
        if (uploadSection) uploadSection.style.display = 'block';
        if (adminStatusText) adminStatusText.innerHTML = '<i class="fa-solid fa-lock-open" style="color: #34D399;"></i> Doctor Portal Active';
        if (adminAuthBtn) adminAuthBtn.innerText = 'Logout';
    } else {
        if (uploadSection) uploadSection.style.display = 'none';
        if (adminStatusText) adminStatusText.innerHTML = '<i class="fa-solid fa-lock"></i> Doctor Portal Locked';
        if (adminAuthBtn) adminAuthBtn.innerText = 'Doctor Login';
    }
    document.querySelectorAll('.delete-video-btn').forEach(btn => {
        btn.style.display = isDoctorLoggedIn ? 'inline-flex' : 'none';
    });
}

// 💬 Written Review Submission & Display Logic
const testimonialsGrid = document.getElementById('testimonialsGrid');
const writtenReviewForm = document.getElementById('writtenReviewForm');
const reviewFeedback = document.getElementById('reviewFeedback');

function appendWrittenReview(name, rating, text) {
    if (!testimonialsGrid) return;
    
    let starsHTML = '';
    const ratingNum = parseInt(rating);
    for (let i = 0; i < ratingNum; i++) {
        starsHTML += '<i class="fa-solid fa-star"></i>';
    }

    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.innerHTML = `
        <div class="stars">${starsHTML}</div>
        <p>"${text}"</p>
        <div class="client-name">— ${name}</div>
    `;
    testimonialsGrid.prepend(card);
}

if (writtenReviewForm) {
    writtenReviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('reviewAuthorName').value.trim();
        const rating = document.getElementById('reviewRating').value;
        const text = document.getElementById('reviewTextContent').value.trim();

        if (!name || !text) return;

        let savedReviews = JSON.parse(localStorage.getItem('healingRootsWrittenReviews')) || [];
        savedReviews.push({ name, rating, text });
        localStorage.setItem('healingRootsWrittenReviews', JSON.stringify(savedReviews));

        appendWrittenReview(name, rating, text);

        reviewFeedback.style.color = '#0E5C36';
        reviewFeedback.innerText = "✨ Thank you! Your review has been posted successfully.";
        writtenReviewForm.reset();

        setTimeout(() => { reviewFeedback.innerText = ""; }, 5000);
    });
}

// 🎥 Video Gallery & Management Logic (Backend Integrated)
const videoGridContainer = document.getElementById('videoGridContainer');

function appendVideoToGrid(name, desc, videoSrc, type = 'patient', videoId = null) {
    if (!videoGridContainer) return;

    const deleteBtnDisplay = isDoctorLoggedIn ? 'inline-flex' : 'none';

    const newCard = document.createElement('div');
    newCard.className = 'video-card';
    newCard.innerHTML = `
        <div class="video-container-box">
            <video controls>
                <source src="${videoSrc}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
        <div class="video-info">
            <h4>${name}</h4>
            <p><i class="fa-solid fa-video" style="color: var(--primary-pink); margin-right: 6px;"></i> ${desc}</p>
            ${videoId ? `<button class="delete-video-btn" style="display: ${deleteBtnDisplay};" onclick="deleteVideo('${videoId}')"><i class="fa-solid fa-trash"></i> Delete Video</button>` : ''}
        </div>
    `;
    videoGridContainer.appendChild(newCard);
}

async function loadVideosFromBackend() {
    if (!videoGridContainer) return;
    try {
        const res = await fetch('/api/videos');
        if (res.ok) {
            const videos = await res.json();
            videoGridContainer.innerHTML = '';
            videos.forEach(vid => {
                appendVideoToGrid(vid.title, vid.description || '', vid.videoUrl, vid.category, vid._id);
            });
        }
    } catch (err) {
        console.error('Video fetch error:', err);
    }
}

async function deleteVideo(videoId) {
    if (!isDoctorLoggedIn) {
        alert("Unauthorized! Only Dr. Radhika can delete videos.");
        return;
    }

    if (!confirm("Kya aap waqai is video ko delete karna chahte hain?")) return;

    try {
        const res = await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Video delete ho gayi!');
            loadVideosFromBackend();
        } else {
            alert('Delete karne me samasya aayi.');
        }
    } catch (err) {
        console.error('Delete error:', err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    applyDoctorAuthUI();

    let savedReviews = JSON.parse(localStorage.getItem('healingRootsWrittenReviews')) || [];
    savedReviews.forEach(item => {
        appendWrittenReview(item.name, item.rating, item.text);
    });

    loadVideosFromBackend();
});

const doctorVideoForm = document.getElementById('doctorVideoForm');
const docUploadFeedback = document.getElementById('docUploadFeedback');

if (doctorVideoForm) {
    doctorVideoForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!isDoctorLoggedIn) {
            alert("Please login as Doctor first.");
            return;
        }

        const category = document.getElementById('docUploadCategory').value;
        const name = document.getElementById('docUploaderName').value.trim();
        const desc = document.getElementById('docUploaderDesc').value.trim();
        const fileInput = document.getElementById('docUploaderFile');
        const file = fileInput.files[0];

        if (!file) return;

        docUploadFeedback.style.color = '#B45309';
        docUploadFeedback.innerText = "Uploading video to Cloudinary/Database, please wait...";

        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', name);
        formData.append('description', desc);
        formData.append('category', category);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                docUploadFeedback.style.color = '#0E5C36';
                docUploadFeedback.innerText = "✨ Success! Video has been published to the gallery.";
                doctorVideoForm.reset();
                loadVideosFromBackend();
            } else {
                docUploadFeedback.style.color = '#DC2626';
                docUploadFeedback.innerText = "Error: " + (data.error || 'Upload failed');
            }
        } catch (err) {
            docUploadFeedback.style.color = '#DC2626';
            docUploadFeedback.innerText = "Network Error during upload.";
            console.error(err);
        }

        setTimeout(() => { docUploadFeedback.innerText = ""; }, 5000);
    });
}