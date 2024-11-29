import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
# Set up WebDriver
service = Service()  # Replace with your ChromeDriver path
driver = webdriver.Chrome(service=service)

driver.get('https://www.amazon.com/ap/signin/ref=cart_empty_sign_in?openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fcart%3Fapp-nav-type%3Dnone%26dc%3Ddf&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0')

# Wait for the user to login manually (you can adjust this or automate it if needed)
input("Please log in to Amazon and press Enter here when done...")

# Check if we are logged in by looking for the user's name in the top navigation bar
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'nav-link-accountList'))
    )  # Check for the account link (user must be logged in)
    print("User is logged in.")
except:
    print("User is not logged in. Exiting.")
    driver.quit()
    exit()
# Navigate to Amazon cart page
driver.get('https://www.amazon.com/gp/cart/view.html')

# Wait for the page to load (adjust as necessary)
time.sleep(5)

# Scrape product data
active_cart_section = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, 'sc-active-cart'))
)  # Target the active cart section
products = active_cart_section.find_elements(By.CSS_SELECTOR, '.sc-list-item')  # Items within active cart
product_list = []

for product in products:
    try:
        name = product.find_element(By.CSS_SELECTOR, '.sc-product-title').text
        # Price selector needs to be scoped to the current product, not the entire driver
        price_symbol = product.find_element(By.CSS_SELECTOR, '.a-price-symbol').text.strip()
        price_whole = product.find_element(By.CSS_SELECTOR, '.a-price-whole').text.strip()
        price_decimal = product.find_element(By.CSS_SELECTOR, '.a-price-fraction').text.strip()

        product_price = price_symbol + price_whole + "." + price_decimal

        # Add the product to the list
        product_list.append({
            'title': name,
            'price': product_price
        })
    except Exception as e:
        print(f"Error scraping a product: {e}")

# Save data to JSON
with open('cart_data.json', 'w', encoding='utf-8') as f:
    json.dump(product_list, f, ensure_ascii=False, indent=4)

print("Data saved to cart_data.json")

# Close the browser
driver.quit()