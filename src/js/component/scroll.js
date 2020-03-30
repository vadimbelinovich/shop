const wrapper = document.querySelector('.wrapper');
const menuSwitch =  document.querySelector("#menu-switch");
const phone = document.querySelector(".phone");

function scroll() {
  menuSwitch.addEventListener('click', function () {
    if(menuSwitch.checked === true) {
      wrapper.classList.add('no-scroll');
      phone.style.zIndex = 0;
    } else {
      wrapper.classList.remove('no-scroll');
      phone.style.zIndex = 1;
      document.querySelector('.list__pages').classList.remove('show')
    }
  })
} 

export default scroll();