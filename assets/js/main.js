
document.addEventListener("DOMContentLoaded", () => {
    const lines = document.querySelectorAll(".home-text .line");
    lines.forEach((line, index) => {
        line.style.opacity = "0";
        line.style.transform = "translateY(10px)";
        line.style.display = "inline-block"


        setTimeout(() => {
            line.style.transition = "opacity 0.9s ease, transform 0.8s ease";
            line.style.opacity = "1";
            line.style.transform = "translateY(0)";
        }, index * 700);
    });

    // animated glass container 
    const glasscontainer = document.querySelector(".glass-container");

    if (glasscontainer){
        glasscontainer.style.opacity = "0";
        glasscontainer.style.transform = "translateY(20px)";


        setTimeout(() =>{
            glasscontainer.style.transition = "opacity 1s ease, transform 0.9s ease";
            glasscontainer.style.opacity = "1";
            glasscontainer.style.transform = "translateY(0)";
        },200)
    } 
    // scroll ttrigered animations for the feature card  

    const featureCard = document.querySelectorAll(".feature-card")

    const observerOption = {
        threshold: 0.2   // trigers when 20% of card is visible 
    };

    const featureObserver = new IntersectionObserver ((entries, observer) =>{
        entries.forEach(entry =>{
            if (entry.isIntersecting){
                entry.target.classList.add("show")
                observer.unobserve(entry.target);
            }
        });
    }, observerOption);
    featureCard.forEach(card =>{
        featureObserver.observe(card);
    });

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll',() => {

        if(window.scrollY > 50){
            navbar.style.background = 'rgba(255, 255, 255, 0.2)';
            navbar.style.backdropFilter = 'blur(20px) saturate(200%)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.1)';
            navbar.style.backdropFilter = 'blur(15px) saturate(180%)';
        }
    });

    /* Scroll animation for phone frames */
    const phones = document.querySelectorAll(".phone-frame");

    const phoneObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    phones.forEach(phone => phoneObserver.observe(phone));

    /* Scroll animation for download button */
    const downloadBtnWrapper = document.querySelector(".reveal-btn");

    if (downloadBtnWrapper) {
        const btnObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        btnObserver.observe(downloadBtnWrapper);
    }

    /* Download button OS detection */
    document.getElementById("downloadAppBtn").addEventListener("click", () => {
        const ua = navigator.userAgent || navigator.vendor || window.opera;

        if (/android/i.test(ua)) {
            window.location.href = "https://play.google.com/store/apps/details?id=YOUR_APP_ID";
        } else if (/iPad|iPhone|iPod/.test(ua)) {
            window.location.href = "https://apps.apple.com/app/YOUR_APP_ID";
        } else {
            alert("Please open this page on your mobile device to download the app.");
        }
    });

    // Team cards scroll animation
    const teamCards = document.querySelectorAll(".team-card");

    const teamObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    teamCards.forEach(card => teamObserver.observe(card));


    
    /* Scroll reveal for order form */
    const orderFormWrapper = document.querySelector(".reveal-order");

    const orderObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    orderObserver.observe(orderFormWrapper);

    /* EmailJS setup */
    (function () {
        emailjs.init("T6xAOF6dujpXRDHlD"); 
    })();

    /* Form submit */
    document.getElementById("orderForm").addEventListener("submit", function (e) {
        e.preventDefault();

        emailjs.sendForm(
            "service_3woomue",   
            "template_jwrw1xh",  
            this
        ).then(() => {
            alert("Order submitted successfully!");
            this.reset();
        }, (error) => {
            alert("Failed to send order. Try again.");
            console.error(error);
        });
    });

    // Footer scroll reveal
    const footer = document.querySelector(".reveal-footer");

    if (footer) {
        const footerObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        footerObserver.observe(footer);
    }

    // Auto year update
    document.getElementById("year").textContent = new Date().getFullYear();


});
