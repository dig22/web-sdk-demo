const SDK = function (apiKey) {

    if (SDK.isLoaded) {
        console.error('SDK already loaded');
        return
    }

    SDK.isLoaded = true

    const codeToBeInjected = `
        <div id="sdk-window-container">
            <div id="sdk-window">
            </div>
        </div>
    `

    const paymentsOrigin = "http://127.0.0.1:8086"  // URL of the payments website, we can use webpack ENV here in future

    const iframeToBeInjected = `<iframe src="${paymentsOrigin}/payments" id="sdk-main-iframe" title="Payment"></iframe>`;


    let codetoInject = new DOMParser().parseFromString(codeToBeInjected, 'text/html').body.childNodes[0];
    
    
    // We inject our container to the client website
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


        el.addEventListener('click', () => {

            // We inject the iframe only when the button is clicked, this is to optimize the load time of the SDK and client page 
            sdkWindow.innerHTML = iframeToBeInjected
            paymentsIframe = document.querySelector('#sdk-main-iframe')

            showScreen()

            paymentsIframe.addEventListener("load", (event) => {
                event.target.contentWindow.postMessage({ eventName: 'register_sdk_parent', apiKey: this.apiKey, options }, paymentsOrigin)
            })

            window.addEventListener("message", (event) => {
                if (event.origin !== paymentsOrigin) { 
                     return;
                }
                event.data.eventName === "payment_success" ? onSuccess(event.data.data) : onFailure(event.data.error);
                hideScreen()
            })
        })
    }
}