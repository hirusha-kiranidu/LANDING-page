(() => {
  "use strict";

  const select = (selector, scope = document) => scope.querySelector(selector);
  const selectAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const state = {
    emailInitialized: false,
    sliderIntervalId: null,
  };

  document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initYear();
    initImageFallbacks();
    initNavigation();
    initRevealAnimations();
    initCounters();
    initAppCarousel();
    initDownloadButton();
    initFaqAccordion();
    initBackToTop();
    initOrderForm();
  });

  function initThemeToggle() {
    const themeToggle = select("#themeToggle");
    const themeToggleIcon = select("i", themeToggle || document);
    const themeToggleText = select(".theme-toggle-text", themeToggle || document);
    if (!themeToggle || !themeToggleIcon || !themeToggleText) return;

    const storageKey = "kidcloud-theme";
    const systemPrefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    let savedTheme = null;
    try {
      savedTheme = window.localStorage.getItem(storageKey);
    } catch (_error) {
      savedTheme = null;
    }

    const initialTheme = savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : (systemPrefersDark ? "dark" : "light");

    applyTheme(initialTheme);

    themeToggle.addEventListener("click", () => {
      const currentTheme = document.body.dataset.theme === "dark" ? "dark" : "light";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);

      try {
        window.localStorage.setItem(storageKey, nextTheme);
      } catch (_error) {
        // Ignore storage errors and keep runtime theme change.
      }
    });

    function applyTheme(theme) {
      document.body.dataset.theme = theme;

      if (theme === "dark") {
        themeToggle.setAttribute("aria-pressed", "true");
        themeToggle.setAttribute("aria-label", "Switch to light mode");
        themeToggleIcon.className = "fa-solid fa-sun";
        themeToggleText.textContent = "Light";
        return;
      }

      themeToggle.setAttribute("aria-pressed", "false");
      themeToggle.setAttribute("aria-label", "Switch to dark mode");
      themeToggleIcon.className = "fa-solid fa-moon";
      themeToggleText.textContent = "Dark";
    }
  }

  function initYear() {
    const yearElement = select("#currentYear");
    if (yearElement) yearElement.textContent = String(new Date().getFullYear());
  }

  function initNavigation() {
    const header = select(".site-header");
    const menuToggle = select(".menu-toggle");
    const nav = select("#primary-navigation");
    const navLinks = selectAll(".nav-link");
    const mobileBreakpoint = 768;

    if (!header || !menuToggle || !nav || navLinks.length === 0) return;

    const isMobileViewport = () =>
      typeof window.matchMedia === "function"
        ? window.matchMedia(`(max-width: ${mobileBreakpoint}px)`).matches
        : window.innerWidth <= mobileBreakpoint;

    const sectionMap = navLinks
      .map((link) => {
        const id = link.getAttribute("href");
        if (!id || !id.startsWith("#")) return null;
        const section = select(id);
        if (!section) return null;
        return { link, section };
      })
      .filter(Boolean);

    const closeMenu = () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      if (isMobileViewport()) {
        nav.setAttribute("aria-hidden", "true");
      } else {
        nav.removeAttribute("aria-hidden");
      }
    };

    const openMenu = () => {
      if (!isMobileViewport()) return;
      nav.classList.add("open");
      menuToggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
      nav.setAttribute("aria-hidden", "false");
    };

    const syncNavigationMode = () => {
      if (!isMobileViewport()) {
        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
        nav.removeAttribute("aria-hidden");
        return;
      }

      nav.setAttribute("aria-hidden", nav.classList.contains("open") ? "false" : "true");
    };

    menuToggle.addEventListener("click", () => {
      if (!isMobileViewport()) return;
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("open")) return;
      const clickedInsideNav = nav.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);
      if (!clickedInsideNav && !clickedToggle) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    const updateHeaderAndActiveLink = () => {
      if (window.scrollY > 18) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      const marker = window.scrollY + 180;
      let activeId = sectionMap[0]?.section.id;

      sectionMap.forEach(({ section }) => {
        if (marker >= section.offsetTop) {
          activeId = section.id;
        }
      });

      navLinks.forEach((link) => {
        const shouldActivate = link.getAttribute("href") === `#${activeId}`;
        link.classList.toggle("active", shouldActivate);
      });
    };

    syncNavigationMode();
    updateHeaderAndActiveLink();
    window.addEventListener("scroll", updateHeaderAndActiveLink, { passive: true });
    window.addEventListener("resize", () => {
      syncNavigationMode();
      updateHeaderAndActiveLink();
    });
  }

  function initRevealAnimations() {
    const revealTargets = selectAll(".reveal");
    if (revealTargets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealTargets.forEach((item) => observer.observe(item));
  }

  function initCounters() {
    const counterElements = selectAll(".stat-number[data-counter-target]");
    if (counterElements.length === 0) return;

    const animateCounter = (element) => {
      const target = Number(element.dataset.counterTarget || "0");
      const suffix = element.dataset.suffix || "";
      const duration = 1400;
      const start = performance.now();

      const tick = (time) => {
        const progress = Math.min((time - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(target * eased);
        element.textContent = `${value.toLocaleString()}${suffix}`;

        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.45 }
    );

    counterElements.forEach((counter) => counterObserver.observe(counter));
  }

  function initAppCarousel() {
    const carousel = select(".app-carousel");
    if (!carousel) return;

    const track = select(".carousel-track", carousel);
    const slides = selectAll(".app-slide", carousel);
    const dots = selectAll(".carousel-dot", carousel);
    const prevButton = select(".carousel-btn.prev", carousel);
    const nextButton = select(".carousel-btn.next", carousel);

    if (!track || slides.length === 0 || dots.length !== slides.length || !prevButton || !nextButton) return;

    let currentIndex = 0;

    const updateSlides = () => {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      slides.forEach((slide, index) => {
        const active = index === currentIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });

      dots.forEach((dot, index) => {
        const active = index === currentIndex;
        dot.classList.toggle("active", active);
        dot.setAttribute("aria-selected", String(active));
      });
    };

    const goToIndex = (index) => {
      const last = slides.length - 1;
      if (index < 0) currentIndex = last;
      else if (index > last) currentIndex = 0;
      else currentIndex = index;
      updateSlides();
    };

    const startAutoSlide = () => {
      stopAutoSlide();
      state.sliderIntervalId = window.setInterval(() => {
        goToIndex(currentIndex + 1);
      }, 5000);
    };

    const stopAutoSlide = () => {
      if (!state.sliderIntervalId) return;
      window.clearInterval(state.sliderIntervalId);
      state.sliderIntervalId = null;
    };

    prevButton.addEventListener("click", () => goToIndex(currentIndex - 1));
    nextButton.addEventListener("click", () => goToIndex(currentIndex + 1));

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => goToIndex(index));
    });

    carousel.addEventListener("mouseenter", stopAutoSlide);
    carousel.addEventListener("mouseleave", startAutoSlide);
    carousel.addEventListener("focusin", stopAutoSlide);
    carousel.addEventListener("focusout", startAutoSlide);

    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToIndex(currentIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToIndex(currentIndex + 1);
      }
    });

    updateSlides();
    startAutoSlide();
  }

  function initDownloadButton() {
    const button = select("#downloadAppBtn");
    const hint = select("#downloadHint");
    if (!button || !hint) return;

    const androidLink = "https://play.google.com/store/apps";
    const iosLink = "https://www.apple.com/app-store/";

    button.addEventListener("click", () => {
      const userAgent = navigator.userAgent || "";

      if (/android/i.test(userAgent)) {
        window.open(androidLink, "_blank", "noopener");
        hint.textContent = "Opening Google Play...";
        return;
      }

      if (/iPhone|iPad|iPod/i.test(userAgent)) {
        window.open(iosLink, "_blank", "noopener");
        hint.textContent = "Opening App Store...";
        return;
      }

      hint.innerHTML = `Use mobile for direct install. Android: <a href="${androidLink}" target="_blank" rel="noopener">Google Play</a> | iOS: <a href="${iosLink}" target="_blank" rel="noopener">App Store</a>`;
    });
  }

  function initFaqAccordion() {
    const faqItems = selectAll(".faq-item");
    if (faqItems.length === 0) return;

    faqItems.forEach((item) => {
      const trigger = select(".faq-question", item);
      const panelId = trigger?.getAttribute("aria-controls");
      const panel = panelId ? select(`#${panelId}`) : null;

      if (!trigger || !panel) return;

      trigger.addEventListener("click", () => {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";

        faqItems.forEach((otherItem) => {
          const otherTrigger = select(".faq-question", otherItem);
          const otherPanelId = otherTrigger?.getAttribute("aria-controls");
          const otherPanel = otherPanelId ? select(`#${otherPanelId}`) : null;
          if (!otherTrigger || !otherPanel) return;

          otherTrigger.setAttribute("aria-expanded", "false");
          otherPanel.hidden = true;
          otherItem.classList.remove("open");
        });

        if (!isOpen) {
          trigger.setAttribute("aria-expanded", "true");
          panel.hidden = false;
          item.classList.add("open");
        }
      });
    });
  }

  function initBackToTop() {
    const button = select("#backToTop");
    if (!button) return;

    const updateButtonState = () => {
      if (window.scrollY > 520) {
        button.classList.add("show");
      } else {
        button.classList.remove("show");
      }
    };

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    updateButtonState();
    window.addEventListener("scroll", updateButtonState, { passive: true });
  }

  function initOrderForm() {
    const form = select("#orderForm");
    const submitButton = select("#submitButton");
    const statusElement = select("#formStatus");

    if (!form || !submitButton || !statusElement) return;

    const fields = {
      name: select("#name", form),
      address: select("#address", form),
      email: select("#email", form),
      phone: select("#phone", form),
      message: select("#message", form),
    };

    const validators = {
      name: (value) => {
        if (!value.trim()) return "Please enter your name.";
        if (value.trim().length < 2) return "Name must be at least 2 characters.";
        return "";
      },
      address: (value) => {
        if (!value.trim()) return "Please enter your address.";
        if (value.trim().length < 8) return "Address is too short.";
        return "";
      },
      email: (value) => {
        if (!value.trim()) return "Please enter your email.";
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value.trim())) return "Enter a valid email address.";
        return "";
      },
      phone: (value) => {
        if (!value.trim()) return "Please enter your phone number.";
        const phonePattern = /^\+?[0-9\s()-]{7,18}$/;
        if (!phonePattern.test(value.trim())) return "Enter a valid phone number.";
        return "";
      },
      message: (value) => {
        if (value.trim().length > 300) return "Message must be 300 characters or less.";
        return "";
      },
    };

    const setFieldError = (fieldName, message) => {
      const field = fields[fieldName];
      const errorElement = select(`#${fieldName}Error`, form);
      if (!field || !errorElement) return;

      errorElement.textContent = message;
      if (message) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }
    };

    const validateField = (fieldName) => {
      const field = fields[fieldName];
      const validator = validators[fieldName];
      if (!field || !validator) return "";

      const error = validator(field.value);
      setFieldError(fieldName, error);
      return error;
    };

    const validateAll = () => {
      return Object.keys(validators).map((fieldName) => ({
        fieldName,
        error: validateField(fieldName),
      }));
    };

    const setStatus = (message, type) => {
      statusElement.textContent = message;
      statusElement.classList.remove("success", "error");
      if (type) statusElement.classList.add(type);
    };

    const setLoading = (isLoading) => {
      submitButton.classList.toggle("is-loading", isLoading);
      submitButton.disabled = isLoading;
    };

    const getFormValues = () => {
      return {
        name: fields.name?.value.trim() || "",
        address: fields.address?.value.trim() || "",
        email: fields.email?.value.trim() || "",
        phone: fields.phone?.value.trim() || "",
        message: fields.message?.value.trim() || "",
      };
    };

    const buildTemplateParams = (values) => {
      const safeMessage = values.message || "No additional message provided.";

      return {
        from_name: values.name,
        user_address: values.address,
        from_email: values.email,
        phone_number: values.phone,
        user_message: safeMessage,
        reply_to: values.email,
      };
    };

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      if (!field) return;
      field.addEventListener("input", () => validateField(fieldName));
      field.addEventListener("blur", () => validateField(fieldName));
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setStatus("", null);

      const results = validateAll();
      const invalid = results.find((result) => result.error);
      if (invalid) {
        fields[invalid.fieldName]?.focus();
        setStatus("Please fix the highlighted fields and try again.", "error");
        return;
      }

      setLoading(true);

      try {
        const publicKey = form.dataset.publicKey;
        const serviceId = form.dataset.serviceId;
        const templateId = form.dataset.templateId;

        if (!window.emailjs || !publicKey || !serviceId || !templateId) {
          throw new Error("EmailJS configuration is missing.");
        }

        if (!state.emailInitialized) {
          try {
            window.emailjs.init({ publicKey });
          } catch (_error) {
            // Backward compatibility for older EmailJS versions.
            window.emailjs.init(publicKey);
          }
          state.emailInitialized = true;
        }

        const formValues = getFormValues();
        const templateParams = buildTemplateParams(formValues);

        await window.emailjs.send(serviceId, templateId, templateParams);

        form.reset();
        Object.keys(fields).forEach((fieldName) => setFieldError(fieldName, ""));
        setStatus("Request sent successfully. Our KidCloud team will contact you soon.", "success");
      } catch (error) {
        setStatus("We could not send your request right now. Please try again in a moment.", "error");
        console.error("EmailJS submission failed:", error);
      } finally {
        setLoading(false);
      }
    });
  }

  function initImageFallbacks() {
    const fallbackImages = selectAll("img[data-fallback-name]");
    if (fallbackImages.length === 0) return;

    fallbackImages.forEach((image) => {
      const applyFallback = () => {
        if (image.dataset.fallbackApplied === "true") return;

        const name = image.dataset.fallbackName || "KidCloud";
        const initials = getInitials(name);
        const svg = `
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'>
            <defs>
              <linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
                <stop offset='0%' stop-color='#0f7af5'/>
                <stop offset='100%' stop-color='#14b8a6'/>
              </linearGradient>
            </defs>
            <rect width='180' height='180' fill='url(#g)'/>
            <circle cx='90' cy='90' r='64' fill='rgba(255,255,255,0.2)'/>
            <text x='50%' y='54%' text-anchor='middle' fill='#ffffff' font-family='Arial, sans-serif' font-size='46' font-weight='700'>${initials}</text>
          </svg>
        `.trim();

        image.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
        image.alt = `${name} placeholder image`;
        image.classList.add("is-fallback");
        image.dataset.fallbackApplied = "true";
      };

      image.addEventListener("error", applyFallback);

      if (!image.getAttribute("src")) {
        applyFallback();
      }
    });
  }

  function getInitials(value) {
    const words = value
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (words.length === 0) return "KC";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
  }
})();
