import os
import time
from playwright.sync_api import sync_playwright

def verify_home():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile viewport size as the app is mobile-first
        context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True)
        page = context.new_page()

        try:
            print("Navigating to http://localhost:3000...")
            page.goto("http://localhost:3000", wait_until="networkidle")

            # Since there is auth, we might just see the login screen.
            # But let's try to wait a bit to see if mock data kicks in or if we can see the layout.
            time.sleep(5)

            print("Capturing screenshot...")
            page.screenshot(path="verification/verification.png", full_page=True)
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_home()
