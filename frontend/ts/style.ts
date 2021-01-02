import { realpath } from "fs";

export {
    setStyleEventListeners
}

function setStyleEventListeners() {
    const navBar = document.querySelector("#nav-container") as HTMLElement;
    const wrapper = document.querySelector("#wrapper") as HTMLElement;
    const description = document.querySelector("#description") as HTMLElement;
    const descriptionAChilds = document.querySelectorAll("#description a") as NodeListOf<HTMLElement>;
    const background = document.querySelector("#background-cover-image") as HTMLElement;
    const chaptersWrapper = document.querySelector("#chapters-wrapper") as HTMLElement;
    const headerContainer = document.querySelector("#header-container") as HTMLElement;
    const onParalaxScroll = () => {
        let navbarBGColor = getComputedStyle(navBar).getPropertyValue('background-color')
        //change to rgba if not and remove spaces
        navbarBGColor = navbarBGColor.replace(/rgb(?=\()/g, 'rgba').replace(/(\((?: *)(?:[0-9\. ]+,){2})([0-9\. ]+)(?= *\))/g, "$1$2, 1.0").replace(/ /g, "");
        let alpha = wrapper.scrollTop * 2 / window.innerHeight * 0.3 + 0.7;
        alpha > 1 && (alpha = 1);
        navbarBGColor = navbarBGColor.replace(/,(?:[0-9\.]+)(?=\))/g, `,${alpha}`);
        navBar.style.backgroundColor = navbarBGColor;
        if(chaptersWrapper.childElementCount < 1) {
            console.log('aaa')
            background.style.top = `${wrapper.scrollTop}px`
        } else {
            const fullHeight = chaptersWrapper.getBoundingClientRect().height + Math.abs(chaptersWrapper.getBoundingClientRect().top - headerContainer.getBoundingClientRect().top);
            const imageHeight = background.getBoundingClientRect().height;
            background.style.top = `${wrapper.scrollTop-(wrapper.scrollTop / (fullHeight-window.innerHeight) / 2 * imageHeight)}px`
        }
    }
    onParalaxScroll();
    wrapper.addEventListener('scroll', onParalaxScroll);
    description.addEventListener("click", () => {
        description.classList.toggle("closed")
    });
    descriptionAChilds.forEach(v => v.addEventListener("click", e => {e.stopPropagation()}, false))
}