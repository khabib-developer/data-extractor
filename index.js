const features = ['familiyasi', 'ismi', 'jinsi', 'otasining ismi', "tug'ilgan sanasi", "tug'ilgan joyi", 'millati', 'kim tomonidan berilgan']

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
   let rotate = 0

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
         const response = await fetch("/predict/", {
            // mode: 'no-cors',
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({base64, shape: {width, height}}),
         })

         const result = await response.json()

         renderInformation(result)

      } catch (e) {
         console.log(e)
      } finally {
         stopLoading()
      }
   }

   function renderInformation(result) {
      features.forEach(item => {
         console.log(item)
         const span = document.querySelector(`span[data-label="${item.toLowerCase()}"]`)
         const text = result[item.toUpperCase()] ? result[item.toUpperCase()] : '<italic>undefined</italic>'
         span.innerHTML = `${text}`
      })
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

// const link = document.createElement("a");
// link.download = "image.jpg";
// link.href = canvas.toDataURL();
// link.click();