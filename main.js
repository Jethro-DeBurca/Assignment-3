// eventBus allows us to share data from one component to another
var eventBus = new Vue()
// Creating the product component
Vue.component('product', {
    props: {
      premium: {
        type: Boolean,
        required: true
      }
    },
// Creating my product html layout using a vue template
    template: `
     <div class="product">
          
        <div class="product-image">
          <img :src="image" class="img"/>
        </div>
  
        <div class="product-info">
            <h1>{{ product }}</h1>
            <p v-if="inStock">In Stock</p>
            <p v-else>Out of Stock</p>
  
            <info-tabs :shipping="shipping" :details="details"></info-tabs>
  
            <div class="color-box"
                 v-for="(variant, index) in variants" 
                 :key="variant.variantId"
                 :style="{ backgroundColor: variant.variantColor }"
                 @mouseover="updateProduct(index)"
                 >
            </div> 
  
            <button v-on:click="addToCart" 
              :disabled="!inStock"
              :class="{ disabledButton: !inStock }"
              >
            Add to cart
            </button>
  
         </div> 

         <product-tabs :reviews="reviews"></product-tabs>
      
      </div>
     `,
// Filling out my product data with product information
    data() {
      return {
          product: 'Mesh back chair',
          brand: 'Chair & Chair',
          selectedVariant: 0,
          details: ['Made in India', '100% solid plastic frame', 'Gender-neutral'],
          variants: [
// First colour data binding
            {
              variantId: 2234,
              variantPrice: 99.99,
              variantColor: 'green',
              variantImage: './assets/green.jpg',
              variantQuantity: 10     
            },
// Second colour data binding
            {
              variantId: 2235,
              variantPrice: 99.99,
              variantColor: 'black',
              variantImage: './assets/black.jpg',
              variantQuantity: 3     
            },
// Third colour data binding
            {
              variantId: 2236,
              variantPrice: 99.99,
              variantColor: 'red',
              variantImage: './assets/red.jpg',
              variantQuantity: 5     
            }
          ],
          reviews: []
      }
    },
// Filling out my product template with javascript methods
      methods: {
// Creating my addToCart method, so it can be called by my onClick event to add product to cart
        addToCart: function() {

         let cartItem = {
         product: this.product,
         variant: this.variants[this.selectedVariant].variantId,
         color: this.variants[this.selectedVariant].variantColor,
         price: this.variants[this.selectedVariant].variantPrice,
         };
            this.$emit('add-to-cart', cartItem);
        },
        updateProduct(index) {  
            this.selectedVariant = index
        }
      },
// Creating my getters in order to display my binded data in my component template
      computed: {
          title() {
              return this.brand + ' ' + this.product  
          },
          image(){
              return this.variants[this.selectedVariant].variantImage
          },
          inStock(){
              return this.variants[this.selectedVariant].variantQuantity
          },
          shipping() {
            if (this.premium) {
              return "Free"
            }
              return 2.99
          }
      },
// Creating my mounted method, so it can be called by my onClick event to post my review
      mounted() {
        eventBus.$on('review-submitted', productReview => {
          this.reviews.push(productReview)
        })
      }
  })




// Creating the product-review sub-component
  Vue.component('product-review', {
// Creating my product-review html layout using a vue template
    template: `
    <form class="review-form" @submit.prevent="onSubmit">

      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name">
      </p>

      <p>
        <label for="review">Review:</label>      
        <textarea id="review" v-model="review"></textarea>
      </p>

      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

      <p>
        <input type="submit" value="Submit">  
      </p>    
  
    </form>
    `,
// Creating my 
    data() {
      return {
        name: null,
        review: null,
        rating: null,
        errors: []
      }
    },
    methods: {
// Creating my onSubmit method to validate/create a review from user input data
      onSubmit() {
        this.errors = []
        if (this.name && this.review && this.rating) {
          let productReview = {
            name: this.name,
            review: this.review,
            rating: this.rating
          }
          eventBus.$emit('review-submitted', productReview)
          this.name = null
          this.review = null
          this.rating = null
        }
// If data field (name, review, or rating) == null (starting value), the review can't be submitted.
        else {
          if(!this.name) this.errors.push("Name required.")
          if(!this.review) this.errors.push("Review required.")
          if(!this.rating) this.errors.push("Rating required.")
        }
      }
    }
  })




// Creating the product-tabs sub-component
  Vue.component('product-tabs', {
    props: {
      reviews: {
        type: Array,
        required: false
      }
    },
// Creating my product-tabs html layout using a vue template
    template: `
      <div>
      
        <ul>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>

        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul v-else>
                <li v-for="(review, index) in reviews" :key="index">
                  <p>{{ review.name }}</p>
                  <p>Rating:{{ review.rating }}</p>
                  <p>{{ review.review }}</p>
                </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a Review'">
          <product-review></product-review>
        </div>
    
      </div>
    `,
// Creating my review tabs to display only data from only one tab at a time.
// This is done by binding the last Clicked tab as the selected tab.
    data() {
      return {
        tabs: ['Reviews', 'Make a Review'],
        selectedTab: 'Reviews'
      }
    }
  })




// Creating the info-tabs sub-component
Vue.component('info-tabs', {
    props: {
      shipping: {
        required: true
      },
      details: {
        type: Array,
        required: true
      }
    },
// Creating my info-tabs html layout using a vue template
    template: `
      <div>
      
        <ul>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>

        <div v-show="selectedTab === 'Shipping'">
          <p>{{ shipping }}</p>
        </div>

        <div v-show="selectedTab === 'Details'">
          <ul>
            <li v-for="detail in details">{{ detail }}</li>
          </ul>
        </div>
    
      </div>
    `,
// Filling out my info-tabs template with javascript data
    data() {
      return {
        tabs: ['Shipping', 'Details'],
        selectedTab: 'Shipping'
      }
    }
  })

// Start of shpping cart ---------------
Vue.component('cart-content', {
  props: {
    showCartContent: {
      type: Boolean,
      required: true,
    },
    items: {
      type: Array,
      required: false
    }
  },
  template: `
    <div v-show="showCartContent" class="cart-content">
      <button @click="hideCartContent" class="cart-content__close">Close</button>

      <h2 class="cart-content__title">Your cart</h2>

      <table v-if="items.length" class="cart-items">
        <thead class="cart-items__head">
          <tr>
            <th class="cart-items__num-label">Num.</th>
            <th class="cart-items__product-label">Item</th>
            <th class="cart-items__price-label">Price</th>
            <th class="cart-items__action">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items">
            <td>{{index + 1}}.</td>
            <td class="cart-items__product">{{item.product}} – {{item.color}}</td>
            <td class="cart-items__price">$ {{item.price}}</td>
            <td class="cart-items__action">
              <button @click="deleteItem(index, item.variant)">
                Remove
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan=2>Total:</td>
            <td class="cart-items__total">$ {{cartTotal}}</td>
            <td class="cart-items__action"></td>
          </tr>
        </tfoot>
      </table>

      <p v-else>No items in your cart.</p>
    </div>
  `,
  methods: {
    hideCartContent() {
      this.$root.showCartContent = false;
    },
    deleteItem(index, variant) {
      this.$root.cart.splice(index, 1);
      eventBus.$emit('cart-item-deleted', variant);
    }
  },
  computed: {
    cartTotal() {
      return this.items.reduce((total, item) => total + item.price, 0).toFixed(2);
    }
  }
})

// Creating the vue app instance to be called in index.html
  var app = new Vue({ 
// Vue instance with options object passed as parameter.
  el: '#app',
  data: {
    premium: true,
    showCartContent: false,
    cart: [],
  },
  methods: {
    updateCart(item) {
      this.cart.push(item);
    },
    toggleCartContent() {
      this.showCartContent = !this.showCartContent;
    }
  }
})

Vue.config.devtools = true;