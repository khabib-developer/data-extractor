const features = [
   'FAMILIYASI',
   'ISMI',
   'JINSI',
   'OTASINING ISMI',
   "TUG'ILGAN SANASI",
   "TUG'ILGAN JOYI",
   'MILLATI',
   'KIM TOMONIDAN BERILGAN',
   'TYPE',
   'COUNTRY CODE',
   'PASSPORT NO',
   'SURNAME',
   'GIVEN NAMES',
   'NATIONALITY',
   "DATE OF BIRTH",
   'SEX',
   "PLACE OF BIRTH",
   'DATE OF ISSUE',
   'DATE OF EXPIRY',
   'JSHSHIR',
   'TIME'
]

document.addEventListener("DOMContentLoaded", () => {

   const rotateAngle = document.querySelector("#rotateAngle")
   const rotateAngleValue = document.querySelector(".rotate__angle__value")
   const previewImg = document.querySelector(".preview-img img")
   const inputFile = document.querySelector(".file-input")
   const fileUpload = document.querySelector(".file__upload")
   const submit = document.querySelector(".fetch-img")
   const leftRotate = document.querySelector(".left-rotate")
   const rightRotate = document.querySelector(".right-rotate")
   const loader = document.querySelector(".loader")
   const wrapper = document.querySelector('.information-wrapper')
   const avatar = document.querySelector(".avatar-mg")
   const undefinedImage = document.querySelector(".undefined-image")
   const ocrInformation = document.querySelector(".ocr-information")
   const ocrButton = document.querySelector(".ocr-information-btn")
   let rotate = 0

   let ocrInformationList = []

   renderFeatures(wrapper)

   rotateAngle.addEventListener("input", updatePreview)

   rightRotate.addEventListener("click", event => {
      if (rotate === 180) rotate = -180
      const angle = 180 - 90 * Math.ceil((90 - rotate) / 90)
      rotateAngle.value = angle
      updatePreview({target: {value: angle}})
   })

   leftRotate.addEventListener("click", event => {
      if (rotate === -180) rotate = 180
      const angle = -(180 - 90 * Math.ceil((90 + +rotate) / 90))
      rotateAngle.value = angle
      updatePreview({target: {value: angle}})
   })

   ocrButton.addEventListener("click", renderOcrInformation)

   fileUpload.addEventListener("dragover", event => {
      event.preventDefault()
      fileUpload.classList.add("border-gray-950")
   })

   fileUpload.addEventListener('dragleave', () => {
      fileUpload.classList.remove('border-gray-950');
   });

   fileUpload.addEventListener("drop", event => {
      event.preventDefault()
      fileUpload.classList.remove('border-gray-950');
      const file = event.dataTransfer.files[0]
      loadImage(file)
   })

   inputFile.addEventListener("change", event => {
      const file = inputFile.files[0]
      loadImage(file)
   })

   submit.addEventListener("click", generateImage)

   const loadImage = (file) => {
      if (!file) return;
      rotateAngle.removeAttribute("disabled")
      submit.removeAttribute("disabled")
      previewImg.src = URL.createObjectURL(file);
   }

   function updatePreview({target: {value}}) {
      rotate = value
      rotateAngleValue.textContent = value
      previewImg.style.transform = `rotate(${value}deg)`;
   }

   async function generateImage() {

      startLoading()

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = previewImg.naturalWidth;
      canvas.height = previewImg.naturalHeight;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      if (rotate !== 0) {
         ctx.rotate(rotate * Math.PI / 180);
      }
      ctx.drawImage(previewImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

      await service(canvas.toDataURL("image/jpeg"), canvas.width, canvas.height)
   }

   async function service(base64, width, height) {
      try {
         const response = await fetch("https://wolfman.uz/predict/", {
            // mode: 'no-cors',
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({base64, shape: {width, height}}),
         })

         const result = await response.json()

         ocrInformation.classList.add("hidden")

         ocrInformationList = result[2]

         renderInformation(result[0])

         renderImageFromBase64(result[1].image)

      } catch (e) {
         console.log(e)
      } finally {
         stopLoading()
      }
   }

   function renderFeatures(wrapper) {
      wrapper.innerHTML = features.map((item, i) => {
         const last = i === features.length - 1
         return `
            <div class="flex">
                 <span class="${last&&"text-green-600"}">
                    ${
                     last ? "CPU " + item.toLowerCase() 
                         : item.toLowerCase()
                     }: &nbsp;
                    </span>
                 <span class="information-text" data-label="${item}"></span>
             </div>
         `
      }).join("")
   }

   function renderInformation(result) {
      let count = 0
      features.forEach((item, i) => {
         if(!result[item.toUpperCase()]) count++
         let text = result[item.toUpperCase()] ? result[item.toUpperCase()] : '<span class="italic normal-case">undefined</span>'
         if (i === 4 || i === 14 || i === 17 || i === 18) {
            text = text.replace(/(\d{2})[ \.]*(\d{2})[ \.]*(\d{4})/g, "$1.$2.$3");
         }

         const span = document.querySelector(`span[data-label="${item}"]`)
         span.innerHTML = `${text}`
      })

      if(count > 3) ocrButton.classList.remove('hidden')
      else ocrButton.classList.add('hidden')
   }

   function renderOcrInformation() {
      ocrInformation.classList.remove("hidden")
      ocrInformation.innerHTML = ocrInformationList.map((item) => {
         return `<span>${item},&nbsp;</span>`
      }).join("")
   }

   function renderImageFromBase64(image) {
      if (image !== 'undefined') {
         avatar.src = `data:image/jpg;base64,${image}`
         undefinedImage.classList.add("hidden")
         return
      }
      avatar.setAttribute('src', 'image.png')
      undefinedImage.classList.remove("hidden")
   }

   function startLoading() {
      loader.classList.remove("!hidden")
      submit.setAttribute('disabled', "1")
   }

   function stopLoading() {
      loader.classList.add("!hidden")
      submit.removeAttribute('disabled')
   }


})
