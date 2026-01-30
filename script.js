/**
 * Free QR Code Generator
 * Main application script for generating and customizing QR codes
 */

// Constants
const CONFIG = {
    DEFAULT_SIZE: 300,
    DEFAULT_URL: "https://github.com/iamhitya",
    DEFAULT_CAPTION: "Made with https://iamhitya.github.io/free-qr-code-generator/",
    RENDER_DELAY: 400,
    COPY_FEEDBACK_DURATION: 2000,
    QR_IMAGE_MARGIN: 10
};

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
    // Caption controls
    disableCaption: null,
    editCaption: null,
    captionEditGroup: null,
    captionText: null,
    // Modal elements
    aboutModal: null,
    openAboutModal: null,
    closeAboutModal: null,
    // QR Code container
    qrCodeContainer: null
};

let qrCode = null;

/**
 * Initialize all DOM element references
 */
function initializeElements() {
    ELEMENTS.qrText = document.getElementById("qr-text");
    ELEMENTS.qrSize = document.getElementById("qr-size");
    ELEMENTS.qrSizeValue = document.getElementById("qr-size-value");
    ELEMENTS.qrColor = document.getElementById("qr-color");
    ELEMENTS.qrBgColor = document.getElementById("qr-bg-color");
    ELEMENTS.dotStyle = document.getElementById("dot-style");
    ELEMENTS.logoUpload = document.getElementById("logo-upload");
    ELEMENTS.removeLogo = document.getElementById("remove-logo");
    ELEMENTS.downloadBtn = document.getElementById("download-btn");
    ELEMENTS.downloadFormat = document.getElementById("download-format");
    ELEMENTS.shareBtn = document.getElementById("share-btn");
    ELEMENTS.disableCaption = document.getElementById("disable-caption");
    ELEMENTS.editCaption = document.getElementById("edit-caption");
    ELEMENTS.captionEditGroup = document.getElementById("caption-edit-group");
    ELEMENTS.captionText = document.getElementById("caption-text");
    ELEMENTS.aboutModal = document.getElementById("about-modal");
    ELEMENTS.openAboutModal = document.getElementById("open-about-modal");
    ELEMENTS.closeAboutModal = document.getElementById("close-about-modal");
    ELEMENTS.qrCodeContainer = document.getElementById("qr-code-container");
}

/**
 * Initialize the QR code instance with default options
 */
function initializeQRCode() {
    const qrOptions = {
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
    
    qrCode = new QRCodeStyling(qrOptions);
    qrCode.append(ELEMENTS.qrCodeContainer);
}

/**
 * Update the QR code with current settings
 */
function updateQRCode() {
    if (!qrCode) return;
    
    qrCode.update({
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
    });
}

/**
 * Handle size slider input changes
 */
function handleSizeChange() {
    ELEMENTS.qrSizeValue.textContent = `${ELEMENTS.qrSize.value}px`;
    updateQRCode();
}

/**
 * Handle logo file upload
 * @param {Event} event - File input change event
 */
function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        qrCode.update({ image: e.target.result });
        ELEMENTS.removeLogo.classList.remove("hidden");
    };
    reader.onerror = () => {
        console.error("Failed to read logo file");
        alert("Error: Failed to read the logo file. Please try again.");
    };
    reader.readAsDataURL(file);
}

/**
 * Remove the logo from the QR code
 */
function handleLogoRemoval() {
    qrCode.update({ image: "" });
    ELEMENTS.logoUpload.value = "";
    ELEMENTS.removeLogo.classList.add("hidden");
}

/**
 * Download the QR code in the selected format
 */
function handleDownload() {
    const format = ELEMENTS.downloadFormat.value;
    qrCode.download({ 
        name: "qrcode", 
        extension: format 
    });
}

/**
 * Update download button text based on selected format
 */
function updateDownloadButtonText() {
    const format = ELEMENTS.downloadFormat.value.toUpperCase();
    ELEMENTS.downloadBtn.textContent = `Download ${format}`;
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
 * Handle caption disable checkbox
 */
function handleCaptionDisable() {
    const isDisabled = ELEMENTS.disableCaption.checked;
    
    if (isDisabled) {
        ELEMENTS.editCaption.checked = false;
        ELEMENTS.captionEditGroup.classList.add("hidden");
    }
}

/**
 * Handle caption edit checkbox
 */
function handleCaptionEdit() {
    const isEditing = ELEMENTS.editCaption.checked;
    
    if (isEditing) {
        ELEMENTS.disableCaption.checked = false;
        ELEMENTS.captionEditGroup.classList.remove("hidden");
    } else {
        ELEMENTS.captionEditGroup.classList.add("hidden");
    }
}

/**
 * Show the about modal
 */
function showModal() {
    document.body.classList.add("modal-open");
    ELEMENTS.aboutModal.classList.add("visible");
}

/**
 * Hide the about modal
 */
function hideModal() {
    document.body.classList.remove("modal-open");
    ELEMENTS.aboutModal.classList.remove("visible");
}

/**
 * Handle modal overlay click (close on backdrop click)
 * @param {Event} event - Click event
 */
function handleModalOverlayClick(event) {
    if (event.target === ELEMENTS.aboutModal) {
        hideModal();
    }
}

/**
 * Handle escape key to close modal
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleEscapeKey(event) {
    if (event.key === "Escape" && ELEMENTS.aboutModal.classList.contains("visible")) {
        hideModal();
    }
}

/**
 * Copy wallet address to clipboard
 * @param {HTMLButtonElement} button - Copy button element
 */
async function copyAddressToClipboard(button) {
    const address = button.dataset.address;
    
    try {
        await navigator.clipboard.writeText(address);
        const originalText = button.textContent;
        button.textContent = "Copied!";
        setTimeout(() => {
            button.textContent = originalText;
        }, CONFIG.COPY_FEEDBACK_DURATION);
    } catch (error) {
        console.error("Failed to copy address:", error);
        alert("Error: Failed to copy address to clipboard.");
    }
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // QR Code generation events
    ELEMENTS.qrText.addEventListener("input", updateQRCode);
    ELEMENTS.qrSize.addEventListener("input", handleSizeChange);
    ELEMENTS.qrColor.addEventListener("input", updateQRCode);
    ELEMENTS.qrBgColor.addEventListener("input", updateQRCode);
    ELEMENTS.dotStyle.addEventListener("change", updateQRCode);
    
    // Logo events
    ELEMENTS.logoUpload.addEventListener("change", handleLogoUpload);
    ELEMENTS.removeLogo.addEventListener("click", handleLogoRemoval);
    
    // Download and share events
    ELEMENTS.downloadFormat.addEventListener("change", updateDownloadButtonText);
    ELEMENTS.downloadBtn.addEventListener("click", handleDownload);
    ELEMENTS.shareBtn.addEventListener("click", handleShare);
    
    // Caption events
    ELEMENTS.disableCaption.addEventListener("change", handleCaptionDisable);
    ELEMENTS.editCaption.addEventListener("change", handleCaptionEdit);
    
    // Modal events
    ELEMENTS.openAboutModal.addEventListener("click", showModal);
    ELEMENTS.closeAboutModal.addEventListener("click", hideModal);
    ELEMENTS.aboutModal.addEventListener("click", handleModalOverlayClick);
    document.addEventListener("keydown", handleEscapeKey);
    
    // Copy button events
    ELEMENTS.aboutModal.querySelectorAll(".copy-btn").forEach((button) => {
        button.addEventListener("click", () => copyAddressToClipboard(button));
    });
}

/**
 * Initialize the application
 */
function initializeApp() {
    initializeElements();
    initializeQRCode();
    initializeEventListeners();
}

// Start the application when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);