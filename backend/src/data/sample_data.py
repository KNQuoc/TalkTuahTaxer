"""
This module contains sample product data that simulates what we'll receive from the frontend.
In reality, this data will come from the frontend team's web scraping.
"""

SAMPLE_PRODUCTS = {
    "amazon": [
        {
            "title": "Sony WH-1000XM4 Wireless Headphones",
            "price": 348.00,
            "description": "Industry-leading noise canceling headphones with 30-hour battery life",
            "platform": "amazon",
            "url": "https://www.amazon.com/sample/headphones"
        },
        {
            "title": "Kindle Paperwhite 6.8\" (2021)",
            "price": 139.99,
            "description": "Kindle Paperwhite with 6.8\" display and thinner borders, adjustable warm light",
            "platform": "amazon",
            "url": "https://www.amazon.com/sample/kindle"
        }
    ],
    "shopify": [
        {
            "title": "Handcrafted Leather Wallet",
            "price": 59.99,
            "description": "Premium full-grain leather wallet, handmade by artisans",
            "platform": "shopify",
            "url": "https://leather-store.myshopify.com/products/wallet"
        },
        {
            "title": "Organic Green Tea Set",
            "price": 24.99,
            "description": "Premium organic green tea selection with ceramic teapot",
            "platform": "shopify",
            "url": "https://tea-store.myshopify.com/products/green-tea-set"
        }
    ]
}