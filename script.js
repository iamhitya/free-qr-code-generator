/**
 * Free QR Code Generator
 * Main application script for generating and customizing QR codes
 */

// ==========================================
// Configuration & Constants
// ==========================================
const CONFIG = {
    DEFAULT_SIZE: 300,
    DEFAULT_URL: "https://www.linkedin.com/in/iamhitya/",
    RENDER_DELAY: 400,
    COPY_FEEDBACK_DURATION: 2000,
    QR_IMAGE_MARGIN: 10,
    MIN_SIZE: 100,
    MAX_SIZE: 1000,
    SIZE_STEP: 10
};

// ==========================================
// DOM Elements Cache
// ==========================================
const ELEMENTS = {
    // QR Code controls
    qrText: null,
    qrSize: null,
    qrSizeValue: null,
    qrColor: null,
    qrBgColor: null,
    dotStyle: null,
    logoUpload: null,
    removeLogo: null,
    downloadBtn: null,
    downloadFormat: null,
    shareBtn: null,
    // Modal elements
    aboutModal: null,
    openAboutModal: null,
    closeAboutModal: null,
    // QR Code container
    qrCodeContainer: null
};

// ==========================================
// Global State
// ==========================================
let qrCode = null;

/**
 * Get element by ID with error handling
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} Element or null
 */
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID '${id}' not found`);
    }
    return element;
}

/**
 * Initialize all DOM element references with validation
 */
function initializeElements() {
    const elementIds = {
        qrText: "qr-text",
        qrSize: "qr-size",
        qrSizeValue: "qr-size-value",
        qrColor: "qr-color",
        qrBgColor: "qr-bg-color",
        dotStyle: "dot-style",
        logoUpload: "logo-upload",
        removeLogo: "remove-logo",
        downloadBtn: "download-btn",
        downloadFormat: "download-format",
        shareBtn: "share-btn",
        aboutModal: "about-modal",
        openAboutModal: "open-about-modal",
        closeAboutModal: "close-about-modal",
        qrCodeContainer: "qr-code-container"
    };

    Object.entries(elementIds).forEach(([key, id]) => {
        ELEMENTS[key] = getElement(id);
    });

    // Validate critical elements
    const requiredElements = ["qrText", "qrCodeContainer", "downloadBtn"];
    const missingElements = requiredElements.filter(key => !ELEMENTS[key]);
    
    if (missingElements.length > 0) {
        throw new Error(`Missing critical elements: ${missingElements.join(", ")}`);
    }
}

/**
 * Get QR code options object with current settings
 * @returns {Object} QR code configuration object
 */
function getQROptions() {
    return {
        width: parseInt(ELEMENTS.qrSize.value, 10),
        height: parseInt(ELEMENTS.qrSize.value, 10),
        data: ELEMENTS.qrText.value || " ",
        dotsOptions: {
            color: ELEMENTS.qrColor.value,
            type: ELEMENTS.dotStyle.value
        },
        backgroundOptions: {
            color: ELEMENTS.qrBgColor.value
        }
    };
}

/**
 * Initialize the QR code instance with default options
 */
function initializeQRCode() {
    try {
        const defaultOptions = {
            width: CONFIG.DEFAULT_SIZE,
            height: CONFIG.DEFAULT_SIZE,
            type: "svg",
            data: CONFIG.DEFAULT_URL,
            image: "",
            dotsOptions: {
                color: "#000",
                type: "square"
            },
            backgroundOptions: {
                color: "#fff"
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: CONFIG.QR_IMAGE_MARGIN
            }
        };

        qrCode = new QRCodeStyling(defaultOptions);
        qrCode.append(ELEMENTS.qrCodeContainer);
    } catch (error) {
        console.error("Failed to initialize QR code:", error);
        ELEMENTS.qrCodeContainer.innerHTML = '<p class="text-danger">Failed to initialize QR code generator.</p>';
    }
}

/**
 * Update the QR code with current settings
 */
function updateQRCode() {
    if (!qrCode) return;

    try {
        qrCode.update(getQROptions());
    } catch (error) {
        console.error("Failed to update QR code:", error);
    }
}

/**
 * Handle size slider input changes
 */
function handleSizeChange() {
    ELEMENTS.qrSizeValue.textContent = `${ELEMENTS.qrSize.value}px`;
    updateQRCode();
}

/**
 * Handle logo file upload with validation
 * @param {Event} event - File input change event
 */
function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert("Logo file is too large. Maximum size is 5MB.");
        event.target.value = "";
        return;
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
        alert("Invalid file type. Please upload PNG, JPEG, or SVG.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            qrCode.update({ image: e.target.result });
            ELEMENTS.removeLogo?.classList.remove("hidden");
        } catch (error) {
            console.error("Failed to set logo:", error);
            alert("Failed to set logo. Please try a different image.");
            event.target.value = "";
        }
    };

    reader.onerror = () => {
        console.error("Failed to read logo file");
        alert("Error: Failed to read the logo file. Please try again.");
        event.target.value = "";
    };

    reader.readAsDataURL(file);
}

/**
 * Remove the logo from the QR code
 */
function handleLogoRemoval() {
    try {
        qrCode.update({ image: "" });
        ELEMENTS.logoUpload.value = "";
        ELEMENTS.removeLogo?.classList.add("hidden");
    } catch (error) {
        console.error("Failed to remove logo:", error);
        alert("Failed to remove logo. Please try again.");
    }
}

/**
 * Download the QR code in the selected format
 */
function handleDownload() {
    try {
        const format = ELEMENTS.downloadFormat.value;
        qrCode.download({
            name: "qrcode",
            extension: format
        });
    } catch (error) {
        console.error("Failed to download QR code:", error);
        alert("Error: Failed to download QR code. Please try again.");
    }
}

/**
 * Update download button text based on selected format
 */
function updateDownloadButtonText() {
    const format = ELEMENTS.downloadFormat.value.toUpperCase();
    const icon = ELEMENTS.downloadBtn.querySelector("i");
    ELEMENTS.downloadBtn.textContent = `Download ${format}`;
    ELEMENTS.downloadBtn.insertAdjacentHTML("afterbegin", '<i class="fas fa-download me-2"></i>');
}

/**
 * Share the QR code using Web Share API
 */
async function handleShare() {
    try {
        // Save current type and switch to canvas for export
        const previousType = qrCode._options.type;
        qrCode.update({ type: "canvas" });
        
        // Wait for canvas to render
        await new Promise(resolve => setTimeout(resolve, CONFIG.RENDER_DELAY));
        
        // Get canvas element
        const canvas = ELEMENTS.qrCodeContainer.querySelector("canvas");
        if (!canvas) {
            throw new Error("Canvas element not found");
        }
        
        // Convert canvas to PNG
        const dataUrl = canvas.toDataURL("image/png");
        
        // Restore original type
        qrCode.update({ type: previousType });
        
        if (!dataUrl.startsWith("data:image/png")) {
            throw new Error("Failed to create PNG image");
        }
        
        // Create blob and file for sharing
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], "qrcode.png", { type: "image/png" });
        
        const shareData = {
            title: "QR Code",
            text: ELEMENTS.qrText.value || "QR Code",
            files: [file]
        };
        
        // Check if sharing is supported
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share(shareData);
        } else {
            alert(
                "Your browser doesn't support file sharing.\n\n" +
                "This feature only works on mobile devices (Android/iOS) and requires HTTPS."
            );
        }
    } catch (error) {
        console.error("Share error:", error);
        alert("Error: Failed to share QR code. Please try downloading instead.");
    }
}

/**
 * Show the about modal using Bootstrap
 */
function showModal() {
    try {
        if (!ELEMENTS.aboutModal) return;
        const modal = new bootstrap.Modal(ELEMENTS.aboutModal);
        modal.show();
    } catch (error) {
        console.error("Failed to show modal:", error);
    }
}

/**
 * Hide the about modal using Bootstrap
 */
function hideModal() {
    try {
        if (!ELEMENTS.aboutModal) return;
        const modal = bootstrap.Modal.getInstance(ELEMENTS.aboutModal);
        if (modal) {
            modal.hide();
        }
    } catch (error) {
        console.error("Failed to hide modal:", error);
    }
}

/**
 * Copy wallet address to clipboard with feedback
 * @param {HTMLButtonElement} button - Copy button element
 */
async function copyAddressToClipboard(button) {
    if (!button) return;

    const address = button.dataset.address;
    if (!address) {
        console.warn("No address found in button dataset");
        return;
    }

    try {
        await navigator.clipboard.writeText(address);
        const originalText = button.textContent;
        const originalHTML = button.innerHTML;
        
        button.textContent = "Copied!";
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.innerHTML = originalHTML;
            button.disabled = false;
        }, CONFIG.COPY_FEEDBACK_DURATION);
    } catch (error) {
        console.error("Failed to copy address:", error);
        alert("Error: Failed to copy address to clipboard.");
    }
}

/**
 * Initialize all event listeners with delegation where appropriate
 */
function initializeEventListeners() {
    // QR Code generation events
    ELEMENTS.qrText?.addEventListener("input", updateQRCode);
    ELEMENTS.qrSize?.addEventListener("input", handleSizeChange);
    ELEMENTS.qrColor?.addEventListener("input", updateQRCode);
    ELEMENTS.qrBgColor?.addEventListener("input", updateQRCode);
    ELEMENTS.dotStyle?.addEventListener("change", updateQRCode);

    // Logo events
    ELEMENTS.logoUpload?.addEventListener("change", handleLogoUpload);
    ELEMENTS.removeLogo?.addEventListener("click", handleLogoRemoval);

    // Download and share events
    ELEMENTS.downloadFormat?.addEventListener("change", updateDownloadButtonText);
    ELEMENTS.downloadBtn?.addEventListener("click", handleDownload);
    ELEMENTS.shareBtn?.addEventListener("click", handleShare);

    // Modal events
    ELEMENTS.openAboutModal?.addEventListener("click", showModal);
    ELEMENTS.closeAboutModal?.addEventListener("click", hideModal);

    // Copy button delegation
    ELEMENTS.aboutModal?.addEventListener("click", (event) => {
        if (event.target.closest(".copy-btn")) {
            const button = event.target.closest(".copy-btn");
            copyAddressToClipboard(button);
        }
    });
}

/**
 * Initialize the application with error handling
 */
function initializeApp() {
    try {
        initializeElements();
        initializeQRCode();
        initializeEventListeners();
        updateDownloadButtonText(); // Set initial button text
        console.log("Application initialized successfully");
    } catch (error) {
        console.error("Failed to initialize application:", error);
        alert("Failed to initialize the QR Code Generator. Please refresh the page.");
    }
}

// ==========================================
// Application Entry Point
// ==========================================

// Start the application when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}