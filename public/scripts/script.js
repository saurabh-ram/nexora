// console.log("Inside script.js");

// function showImage() {
//     let imageLink = URL.createObjectURL(posterUploadBtn.files[0]);
//     imgView.style.backgroundImage = `url(${imageLink})`;
//     imgView.firstElementChild.style.display = "none"
//     imgView.textContent = "";
//     imgView.style.border = 0;
// }

async function showImage(inputId, previewId) {
    // console.log(previewId);
    const previewImg = document.getElementById(previewId);
    let imageLink = URL.createObjectURL(document.getElementById(inputId).files[0]);
    previewImg.style.backgroundImage = `url(${imageLink})`;
    previewImg.firstElementChild.style.display = "none";
    previewImg.textContent = "";
    previewImg.style.border = 0;
}

async function setupDropZone(dropZoneId, inputId, previewId) {
    const dropZone = document.getElementById(dropZoneId);
    if (dropZone) {
        const imgView = document.getElementById(dropZoneId).querySelector(".imgView");
        const fileInput = document.getElementById(inputId);

        // imgView.addEventListener("click", () => fileInput.click());

        dropZone.addEventListener("dragover", async (e) => {
            e.preventDefault();
            imgView.classList.add("highlight");
            Array.from(imgView.getElementsByTagName("span")).forEach(s => {
                s.classList.remove("grey-text");
                s.style.color = "#008cff";
            });
            // let imageSrc = imgView.firstElementChild.src;
            // imgView.firstElementChild.src = await getBlueImageName(imageSrc);
        });

        dropZone.addEventListener("dragleave", async () => {
            imgView.classList.remove("highlight");
            Array.from(imgView.getElementsByTagName("span")).forEach(s => {
                s.style.removeProperty("color");
                s.classList.add("grey-text");
            });
            // let imageSrc = imgView.firstElementChild.src;
            // imgView.firstElementChild.src = await getOgImageName(imageSrc);
        });

        dropZone.addEventListener("drop", async (e) => {
            e.preventDefault();
            imgView.classList.remove("highlight");
            imgView.firstElementChild.style.display = "none";
            const file = e.dataTransfer.files[0];
            if (file) {
                fileInput.files = e.dataTransfer.files;
                await showImage(inputId, previewId);
                dropZone.querySelector(".fileName").textContent = file.name;
            }
        });

        fileInput.addEventListener("change", async () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                await showImage(inputId, previewId);
                dropZone.querySelector(".fileName").textContent = file.name;
            }
        });
    }
}


function updateTextOverflowClass() {
    const card = document.querySelector(".recent-post");
    if (card) {
        if (window.innerWidth > 950) {
            document.querySelector(".recent").classList.add("text-overflow-12l");
            document.querySelector(".recent").classList.remove("text-overflow-4l");
        } else {
            document.querySelector(".recent").classList.add("text-overflow-4l");
            document.querySelector(".recent").classList.remove("text-overflow-12l");
        }
    }
}

// Check if an individual element exists
function addEventIfIdExists(selector, event, callback) {
    const element = document.querySelector(selector);
    if (element) element.addEventListener(event, callback);
}




async function main() {

    // Add an Event Listener for Hamburger
    addEventIfIdExists(".hamburger", "click", () => {
        document.querySelector(".right-side-bar").style.transform = "translateX(0%)";
        document.querySelector(".right-side-bar").style.right = "0";
        document.querySelector(".right-side-bar").style.opacity = "1";
    });

    // Add an Event Listener for Close button
    addEventIfIdExists("#closeHamBtn", "click", () => {
        document.querySelector(".right-side-bar").style.transform = "var(--sidebarTransform)";
        document.querySelector(".right-side-bar").style.opacity = "0.5";
    });

    // Add an Event Listener for App Logo
    addEventIfIdExists(".app-logo", "click", () => {
        window.location.href = "/";
    });

    // // Add an Event Listener to show the selected image
    // addEventIfIdExists("#posterUploadBtn", "change", showImage);

    // // Add an Event Listeners for drag and drop feature
    // addEventIfIdExists("#uploadPoster", "dragover", function (event) {
    //     event.preventDeafault();
    // });
    // addEventIfIdExists("#uploadPoster", "drop", function (event) {
    //     event.preventDeafault();
    //     posterUploadBtn.files = event.dataTransfer.files;
    //     showImage();
    // });

    // Initialize drag & drop for both image zones
    await setupDropZone("uploadPoster", "posterUploadBtn", "imgPreview");


    // Listen for window resize
    updateTextOverflowClass();
    window.addEventListener("resize", updateTextOverflowClass);

    
    // Script for New Post
    const yearDropdown = document.getElementById("releaseYear");
    const currentYear = new Date().getFullYear();
    if (yearDropdown) {
        for (let year = currentYear; year >= 1900; year--) {
            let option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearDropdown.appendChild(option);
        }
    }

}

main();
