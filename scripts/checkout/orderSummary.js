import {cart, removeFromCart, saveToStorage, updateDeliveryOption, updateQuantityById} from '../../data/cart.js';
import {products, getProduct} from '../../data/products.js';
import {formatCurrency} from '../utils/money.js';
import {hello} from 'https://unpkg.com/supersimpledev@1.0.1/hello.esm.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import {deliveryOptions, getDeliveryOption} from '../../data/deliveryOptions.js';
import {renderPaymentSummary} from './paymentSummary.js';

export function renderOrderSummary() {
  let cartSummaryHTML = '';

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;

    const matchingProduct = getProduct(productId);

    const deliveryOptionId = cartItem.deliveryOptionId;

    const deliveryOption = getDeliveryOption(deliveryOptionId);

    const today = dayjs();
    const deliveryDate = today.add(
      deliveryOption.deliveryDays,
      'days'
    );
    const dateString = deliveryDate.format(
      'dddd, MMMM D'
    );

    cartSummaryHTML += `
      <div class="cart-item-container
        js-cart-item-container
        js-cart-item-container-${matchingProduct.id}"
        data-product-id="${matchingProduct.id}"
        >
        <div class="delivery-date">
          Delivery date: ${dateString}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image"
            src="${matchingProduct.image}">

          <div class="cart-item-details">
            <div class="product-name">
              ${matchingProduct.name}
            </div>
            <div class="product-price">
              ${matchingProduct.getPrice()}
            </div>
            <div class="product-quantity
              js-product-quantity-${matchingProduct.id}">
              <span>
                Quantity: <span class="quantity-label">${cartItem.quantity}</span>
              </span>
              <span class="update-quantity-link link-primary" data-product-id = "${matchingProduct.id}">
                Update
              </span>
              <span class="delete-quantity-link link-primary js-delete-link
                js-delete-link-${matchingProduct.id}"
                data-product-id="${matchingProduct.id}">
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            ${deliveryOptionsHTML(matchingProduct, cartItem)}
          </div>
        </div>
      </div>
    `;
  });

  function deliveryOptionsHTML(matchingProduct, cartItem) {
    let html = '';

    deliveryOptions.forEach((deliveryOption) => {
      const today = dayjs();
      const deliveryDate = today.add(
        deliveryOption.deliveryDays,
        'days'
      );
      const dateString = deliveryDate.format(
        'dddd, MMMM D'
      );

      const priceString = deliveryOption.priceCents === 0
        ? 'FREE'
        : `$${formatCurrency(deliveryOption.priceCents)} -`;

      const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

      html += `
        <div class="delivery-option js-delivery-option"
          data-product-id="${matchingProduct.id}"
          data-delivery-option-id="${deliveryOption.id}">
          <input type="radio"
            ${isChecked ? 'checked' : ''}
            class="delivery-option-input"
            name="delivery-option-${matchingProduct.id}">
          <div>
            <div class="delivery-option-date">
              ${dateString}
            </div>
            <div class="delivery-option-price">
              ${priceString} Shipping
            </div>
          </div>
        </div>
      `
    });

    return html;
  }

  
  updateItemsCounter()

  document.querySelector('.js-order-summary')
    .innerHTML = cartSummaryHTML;

  document.querySelectorAll('.js-delete-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        removeFromCart(productId);

        const container = document.querySelector(
          `.js-cart-item-container-${productId}`
        );
        container.remove();

        renderPaymentSummary();
        updateItemsCounter()
      });
    });

  document.querySelectorAll('.js-delivery-option')
    .forEach((element) => {
      element.addEventListener('click', () => {
        const {productId, deliveryOptionId} = element.dataset;
        updateDeliveryOption(productId, deliveryOptionId);
        renderOrderSummary();
        renderPaymentSummary();
      });
    });

    document.querySelectorAll('.update-quantity-link')
  .forEach((element) => {
    element.addEventListener('click', (event) => {
      const parent = event.target.closest('.product-quantity');
      const quantityLabel = parent.querySelector('.quantity-label');

      // Получаем productId из data-атрибута
      const productId = event.target.dataset.productId;

      // Проверяем, есть ли уже инпут (чтобы не дублировать)
      if (parent.querySelector('.update-input')) return;

      // Создаём инпут
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'update-input';
      input.value = quantityLabel.textContent;
      input.min = 1;
      input.max = 10;
      
      // Создаём кнопку сохранения
      const saveButton = document.createElement('span');
      saveButton.textContent = 'Save';
      saveButton.className = 'link-primary save-button';

      // Очищаем элемент и добавляем инпут + кнопку
      parent.innerHTML = '';
      parent.appendChild(input);
      parent.appendChild(saveButton);

      // Обработчик нажатия на Save
      saveButton.addEventListener('click', () => {
        const newQuantity = parseInt(input.value, 10);

        if (isNaN(newQuantity) || newQuantity < 1) {
          return;
        }

        // Обновляем количество в корзине
        const cartItem = cart.find(item => item.productId === productId);
        if (cartItem) {
          cartItem.quantity = newQuantity;
        }
        updateQuantityById(productId, newQuantity)
        saveToStorage()
        renderOrderSummary(); // Перерисовываем корзину
        renderPaymentSummary(); // Обновляем итоговую сумму
      });
    });
  });


    function updateItemsCounter() {
      document.querySelector('.return-to-home-link').innerHTML = `${cart.length} items`
    }
}