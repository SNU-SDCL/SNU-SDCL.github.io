import asyncio
import hashlib
import re
import zipfile
from pathlib import Path

from playwright.async_api import async_playwright


PAGE_URL = "https://sites.google.com/site/sangsookist/group-memories?authuser=0"

OUT_DIR = Path("group_memories")
ZIP_NAME = "group_memories.zip"


def normalize_url(url):
    return re.sub(r"=[^/?#]+$", "", url)


def get_extension(content_type):
    content_type = content_type.lower()

    if "png" in content_type:
        return ".png"
    elif "webp" in content_type:
        return ".webp"
    elif "gif" in content_type:
        return ".gif"
    else:
        return ".jpg"


async def main():

    OUT_DIR.mkdir(exist_ok=True)

    for f in OUT_DIR.iterdir():
        if f.is_file():
            f.unlink()

    images = {}

    async with async_playwright() as p:

        browser = await p.chromium.launch(
            headless=False
        )

        context = await browser.new_context(
            viewport={
                "width": 1600,
                "height": 1200
            }
        )

        page = await context.new_page()

        pending_tasks = set()

        async def capture_image(response):

            url = response.url

            if "/sitesv/" not in url:
                return

            if "googleusercontent.com" not in url:
                return

            try:

                if response.status != 200:
                    return

                content_type = response.headers.get(
                    "content-type",
                    ""
                )

                if not content_type.startswith("image/"):
                    return

                data = await response.body()

                if len(data) < 10000:
                    return

                key = normalize_url(url)

                if (
                    key not in images
                    or len(data) > len(images[key]["data"])
                ):

                    images[key] = {
                        "data": data,
                        "type": content_type,
                        "url": url
                    }

                    print(
                        f"\rImages collected: {len(images)}",
                        end="",
                        flush=True
                    )

            except Exception:
                pass

        def response_handler(response):

            task = asyncio.create_task(
                capture_image(response)
            )

            pending_tasks.add(task)

            task.add_done_callback(
                pending_tasks.discard
            )

        context.on(
            "response",
            response_handler
        )

        print("Opening page...")

        await page.goto(
            PAGE_URL,
            wait_until="domcontentloaded",
            timeout=60000
        )

        await page.wait_for_timeout(2000)

        print("\nLoading all images...")

        y = 0
        step = 700

        while True:

            height = await page.evaluate(
                "document.documentElement.scrollHeight"
            )

            if y >= height:
                break

            await page.evaluate(
                f"window.scrollTo(0, {y})"
            )

            await page.wait_for_timeout(120)

            y += step

        await page.evaluate(
            "window.scrollTo(0, document.body.scrollHeight)"
        )

        await page.wait_for_timeout(3000)

        while pending_tasks:

            tasks = list(pending_tasks)

            await asyncio.gather(
                *tasks,
                return_exceptions=True
            )

        print()
        print(f"Total images collected: {len(images)}")

        await browser.close()

    print("Saving images...")

    seen_hashes = set()

    number = 1

    for item in images.values():

        data = item["data"]

        file_hash = hashlib.md5(data).hexdigest()

        if file_hash in seen_hashes:
            continue

        seen_hashes.add(file_hash)

        ext = get_extension(
            item["type"]
        )

        filename = (
            OUT_DIR /
            f"photo_{number:03d}{ext}"
        )

        filename.write_bytes(data)

        number += 1

    total = number - 1

    print(f"Final image count: {total}")

    print("Creating ZIP archive...")

    with zipfile.ZipFile(
        ZIP_NAME,
        "w",
        zipfile.ZIP_DEFLATED
    ) as z:

        for file in sorted(
            OUT_DIR.iterdir()
        ):

            if file.is_file():

                z.write(
                    file,
                    arcname=file.name
                )

    print()
    print("==============================")
    print("Complete")
    print(f"Image count: {total}")
    print(f"ZIP: {ZIP_NAME}")
    print("==============================")


asyncio.run(main())
