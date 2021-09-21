const codeToBeInjected = `
    <div id="sdk-window-container">
        <div id="sdk-window">
        </div>
    </div>
`

const iframeToBeInjected = `<iframe src="../payments/" id="sdk-main-iframe" title="Payment"></iframe>`;

const SDK = function (apiKey) {

    if (SDK.isLoaded) {
        console.error('SDK already loaded');
        return
    }

    SDK.isLoaded = true

    let codetoInject = new DOMParser().parseFromString(codeToBeInjected, 'text/html').body.childNodes[0];
    document.body.appendChild(codetoInject);

    let sdkWindow = document.querySelector("#sdk-window");
    let sdkWindowContainer = document.querySelector("#sdk-window-container");

    sdkWindow.classList.add("hidden");
    sdkWindowContainer.classList.add("hidden");


    var showScreen = () => {
        sdkWindow.classList.remove("hidden");
        sdkWindow.classList.add("show");
        sdkWindowContainer.classList.remove("hidden");
        sdkWindowContainer.classList.add("show");
    }

    var hideScreen = () => {
        sdkWindow.classList.remove("show");
        sdkWindow.classList.add("hidden");
        sdkWindowContainer.classList.remove("show");
        sdkWindowContainer.classList.add("hidden");
    }

    this.registerPaymentButton = (el, options, onSuccess, onFailure) => {


        el.addEventListener('click', (event) => {

            sdkWindow.innerHTML = iframeToBeInjected

            showScreen()

            document.querySelector('#sdk-main-iframe').addEventListener("load", (event) => {
                console.log('posting register message to iframe')
                event.target.contentWindow.postMessage({ eventName: 'register_sdk_parent', apiKey: this.apiKey, options }, '*')
            })

            window.addEventListener("message", (event) => {
                //TODO Check origin
                console.log(event)
                if (event.data.eventName === "payment_success") {
                    onSuccess(event.data.data)
                } else {
                    onFailure(event.data.error)
                }

                hideScreen()
            })
        })
    }
}