import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Set up WebDriver
service = Service('path_to_chromedriver')  # Replace with your ChromeDriver path
driver = webdriver.Chrome(service=service)

driver.get('https://www.amazon.com/ap/signin')

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
        price_whole = product.find_element(By.CSS_SELECTOR, '.a-price-whole').text.strip()
        try:
            price_decimal = product.find_element(By.CSS_SELECTOR, '.a-price-decimal').text.strip()
        except:
            price_decimal = ''  # If there's no decimal part
        product_price = price_whole + price_decimal
        product_list.append({
            'name': name,
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