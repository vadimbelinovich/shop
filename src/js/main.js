"use strict";
document.addEventListener("DOMContentLoaded", () => {
  // Элементы DOM
  const goodsWrapper = document.querySelector(".goods-wrapper .container");
  const cartBtn = document.getElementById("cart");
  const cart = document.querySelector(".cart");
  const cardCounter = cartBtn.querySelector(".counter");
  const cartWrapper = document.querySelector(".cart-wrapper");
  const btnSortName = document.querySelector(".sort-name");
  const btnSortPrice = document.querySelector(".sort-price");
  const btnPrev = document.querySelector(".btn-prev");
  const btnNext = document.querySelector(".btn-next");
  const inputAvb = document.querySelector(".available");
  let avbStatus = false;
  let currentSort = "title";
  let currentSortDir = "asc";
  let totalItems = 0;
  const page = {
    current: 1,
    length: 15
  };

  // Создаем объект корзины с id товаров и их количеством
  const goodsBasket = {};

  //  Функция, показывающая только доступные товары
  const checkAvb = () => {
    if (inputAvb.checked === true) avbStatus = true;
    else avbStatus = false;
  };

  //  Функция, показывающая спинер в каталоге и в корзине
  const loading = () => {
    const spinner = `
            <div class="spinner">
              <div class="spinner-loading">
              </div>
            </div>
        `;
    goodsWrapper.innerHTML = spinner; // каталог
    cartWrapper.innerHTML = spinner; // корзина
  };

  // Извлечение карточек из БД с их последующей фильтрацией и рендиренгом
  const getGoods = (handler, filter) => {
    loading(); // спиннер
    checkPage(); // проверяем страницу
    setTimeout(() => {
      // вводим временную задержку для демонстрации спиннера
      fetch("./db/db.json") // извлечение товаров из БД
        .then(response => response.json())
        .then(filter) // фильтрация
        .then(handler); // рендеринг
    }, 300);
  };

  // Создаем карточку товара для каталога
  const createGardsGoods = (id, title, price, img, available) => {
    const card = document.createElement("div");
    card.className = "card-wrapper";
    if (available === false) {
      card.innerHTML = `
        <div class="card">
          <div class="card-img-wrapper">
            <img class="card-img-top" src="${img}" alt="">
          </div>
          <div class="card-body">
            <a href="#" class="card-title">${title}</a>
            <div class="card-price">${price} ₽</div>
            <div class="card-add">
              <button>Нет в наличии</button>
            </div>
          </div>
        </div>
        `;
    } else {
      card.innerHTML = `
        <div class="card">
          <div class="card-img-wrapper">
            <img class="card-img-top" src="${img}" alt="">
          </div>
          <div class="card-body">
            <a href="#" class="card-title">${title}</a>
            <div class="card-price">${price} ₽</div>
            <div class="card-add">
              <button class="card-add-cart" data-goods-id="${id}">Добавить в корзину</button>
            </div>
          </div>
        </div>
      `;
    }

    return card;
  };

  // Рендеринг карточек товаров
  const renderCard = items => {
    goodsWrapper.textContent = "";
    if (items.length) {
      items.forEach(({ id, title, price, imgMin, available }) => {
        goodsWrapper.append(
          createGardsGoods(id, title, price, imgMin, available)
        );
      });
    } else {
      goodsWrapper.textContent =
        "❌ Извините, мы не нашли товаров по вашему запросу!";
    }
  };

  // Рендеринг всех карточек товаров для корзины
  const renderBasket = items => {
    cartWrapper.innerHTML = "";
    if (items.length) {
      items.forEach(({ id, title, price, imgMin }) => {
        cartWrapper.append(createCartGoodsBasket(id, title, price, imgMin));
      });
    } else {
      cartWrapper.innerHTML =
        '<div id="cart-empty">Ваша корзина пока пуста</div >';
    }
  };

  // Рендеринг одной карточки товара для корзины
  const createCartGoodsBasket = (id, title, price, img) => {
    const card = document.createElement("div");
    card.className = "goods";
    card.innerHTML = `
            <div class="goods-img-wrapper">
                <img class="goods-img" src="${img}" alt="">
            </div>
            <div class="goods-description">
                <h2 class="goods-title">${title}</h2>
                <p class="goods-price">${price} ₽</p>
            </div>
            <div class="goods-price-count">
              <div class="goods-count">${goodsBasket[id]}</div>
              <div class="goods-trigger">
                  <button class="goods-delete" data-goods-id="${id}"></button>
              </div>
                
            </div>
        `;
    return card;
  };

  // Расчет стоимости всех товаров в корзине
  const calcTotalPrice = goods => {
    let sum = goods.reduce((accum, item) => {
      return accum + item.price * goodsBasket[item.id];
    }, 0);
    cart.querySelector(".cart-total>span").textContent = sum.toFixed(2);
  };

  // Открываем корзину - фильтр товаров для корзины
  const showCardBasket = goods => {
    const basketGoods = goods.filter(item =>
      goodsBasket.hasOwnProperty(item.id)
    );
    calcTotalPrice(basketGoods);
    return basketGoods;
  };

  //  - рендеринг корзины
  const openCart = event => {
    event.preventDefault();
    cart.style.display = "flex";
    document.addEventListener("keyup", closeCart);
    getGoods(renderBasket, showCardBasket);
    goodsWrapper.innerHTML = "";
  };

  // Закрываем корзину
  const closeCart = event => {
    const target = event.target;

    if (
      target === cart ||
      target.classList.contains("cart-close") ||
      event.keyCode === 27
    ) {
      cart.style.display = "";
      document.addEventListener("keyup", closeCart);
      getGoods(renderCard, sortFunc);
    }
  };

  // Сортировка карточек
  const sortFunc = item => {
    totalItems = Object.keys(item).length;
    return item
      .filter((row, index) => {
        if (avbStatus === false) return row;
        if (avbStatus === true) return row.available === true;
      })
      .sort((a, b) => {
        let mod = 1;
        if (currentSortDir === "desc") mod = -1;
        if (a[currentSort] < b[currentSort]) return -1 * mod;
        if (a[currentSort] > b[currentSort]) return 1 * mod;
        return 0;
      })
      .filter((row, index) => {
        let start = (page.current - 1) * page.length;
        let end = page.current * page.length;
        if (index >= start && index < end) return true;
      });
  };

  const sortType = function(e) {
    e.preventDefault();
    if (e.target.dataset["sort"] === currentSort) {
      currentSortDir = currentSortDir === "asc" ? "desc" : "asc";
    } else {
      currentSort = e.target.dataset["sort"];
    }
    if (e.target.dataset["sort"] === "title") {
      btnSortName.classList.add("active");
      btnSortPrice.classList.remove("active");
    } else {
      btnSortPrice.classList.add("active");
      btnSortName.classList.remove("active");
    }
    page.current = 1;
    getGoods(renderCard, sortFunc);
  };

  const prevPage = function() {
    if (page.current > 1) {
      page.current -= 1;
      getGoods(renderCard, sortFunc);
    }
  };

  const nextPage = function() {
    if (page.current * page.length < totalItems) {
      page.current += 1;
      getGoods(renderCard, sortFunc);
    }
  };

  const checkPage = function() {
    if (page.current === 1) btnPrev.classList.add("hide");
    else if (page.current * page.length > totalItems)
      btnNext.classList.add("hide");
    else {
      btnPrev.classList.remove("hide");
      btnNext.classList.remove("hide");
    }
  };

  // Количество товаров в корзине и в списке понравившихся
  const checkCount = () => {
    cardCounter.textContent = Object.keys(goodsBasket).length;
  };

  // Сoхраниение и извлечение ls из хранилища браузера
  const storageQuery = get => {
    if (get) {
      if (localStorage.getItem("goodsBasket")) {
        // копируем ls с id товаров корзины в объект корзина
        Object.assign(
          goodsBasket,
          JSON.parse(localStorage.getItem("goodsBasket"))
        );
      }
      checkCount();
    } else {
      // записываем данные об id товаров из корзины в ls
      localStorage.setItem("goodsBasket", JSON.stringify(goodsBasket));
    }
  };

  // id товара записываем в объект КОРЗИНА
  const addBasket = id => {
    if (goodsBasket[id]) {
      goodsBasket[id] += 1;
    } else {
      goodsBasket[id] = 1;
    }
    checkCount(); // подсчитываем количество товаров в корзине
    storageQuery(); // сохраняем id и количество товаров в куки браузера
  };

  // Обработчик клика внутри карточки товара
  const handlerGoods = event => {
    const target = event.target;
    //  если товар  добавляем в корзину
    if (target.classList.contains("card-add-cart")) {
      addBasket(target.dataset.goodsId);
    }
  };

  // Удаление товара из корзины
  const removeGoods = id => {
    delete goodsBasket[id]; // удаление id товара из корзины
    checkCount(); // пересчет стоимости товаров находящихся в корзине
    storageQuery(); // записись объекта корзина с id и количеством товаров в куки браузера
    getGoods(renderBasket, showCardBasket); // рендеринг новой корзины
    goodsWrapper.innerHTML = ""; // не показываем каталог товаров; только то, что вкорзине
  };

  // Обработка событий инициализированных внутри корзины
  const handlerBasket = () => {
    const target = event.target;
    if (target.classList.contains("goods-delete")) {
      // кликнули по иконке "мусорное ведро"
      removeGoods(target.dataset.goodsId);
    }
  };

  // Назначаем обработчики событий
  goodsWrapper.addEventListener("click", handlerGoods); // показать все товары
  btnSortName.addEventListener("click", sortType);
  btnSortPrice.addEventListener("click", sortType);
  btnPrev.addEventListener("click", prevPage);
  btnNext.addEventListener("click", nextPage);
  inputAvb.addEventListener("click", () => {
    checkAvb();
    getGoods(renderCard, sortFunc);
  });
  cartBtn.addEventListener("click", openCart); // открыть корзину
  cart.addEventListener("click", closeCart); // закрыть корзину
  cartWrapper.addEventListener("click", handlerBasket); // клик по иконкам внутри корзины

  // Инициализация магазина
  const storeInit = () => {
    // - загрузка товаров и рендеринг их карточек
    getGoods(renderCard, sortFunc);
    // - извлечение из localStorage id товаров, которые были добавленны в список желаний
    storageQuery(true);
  };

  storeInit();
});
