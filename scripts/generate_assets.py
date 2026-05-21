import os
# pyrefly: ignore [missing-import]
from PIL import Image, ImageDraw

def main():
    source_path = os.path.join("public", "logo.png")
    if not os.path.exists(source_path):
        print(f"Error: Source logo not found at {source_path}")
        return

    print("Loading source logo...")
    logo = Image.open(source_path)
    if logo.mode != "RGBA":
        logo = logo.convert("RGBA")

    # Step 1: Make a perfectly square source image (transparent padding)
    w, h = logo.size
    max_dim = max(w, h)
    square_logo = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
    square_logo.paste(logo, ((max_dim - w) // 2, (max_dim - h) // 2))

    # Determine lanczos resampling attribute (compatible with older & newer Pillow versions)
    resample_algo = getattr(Image, 'Resampling', Image).LANCZOS

    # Step 2: Generate Web Favicons
    print("Generating web favicons...")
    favicon_sizes = [16, 32, 48, 64, 128]
    favicon_imgs = []
    for sz in favicon_sizes:
        favicon_imgs.append(square_logo.resize((sz, sz), resample=resample_algo))

    # Save to both target locations
    os.makedirs(os.path.join("src", "app"), exist_ok=True)
    os.makedirs("public", exist_ok=True)

    # Save as ICO (multi-size)
    favicon_imgs[0].save(
        os.path.join("src", "app", "favicon.ico"),
        format="ICO",
        sizes=[(sz, sz) for sz in favicon_sizes],
        append_images=favicon_imgs[1:]
    )
    favicon_imgs[0].save(
        os.path.join("public", "favicon.ico"),
        format="ICO",
        sizes=[(sz, sz) for sz in favicon_sizes],
        append_images=favicon_imgs[1:]
    )
    print("Web favicons successfully generated!")

    # Step 3: Define Android Asset Locations & Specifications
    res_base = os.path.join("android", "app", "src", "main", "res")
    
    # Monolithic background color
    bg_color = (8, 8, 16) # #080810 brand dark background
    
    # launcher sizes: (density, monolithic/round size, adaptive foreground size)
    launcher_specs = {
        "mdpi": (48, 108),
        "hdpi": (72, 162),
        "xhdpi": (96, 216),
        "xxhdpi": (144, 324),
        "xxxhdpi": (192, 432),
    }

    print("Generating Android Launcher Icons...")
    for density, (icon_sz, adaptive_sz) in launcher_specs.items():
        density_dir = os.path.join(res_base, f"mipmap-{density}")
        os.makedirs(density_dir, exist_ok=True)

        # A. Monolithic square icon (logo padded inside a filled brand-colored background)
        mono_img = Image.new("RGBA", (icon_sz, icon_sz), bg_color + (255,))
        # Scale logo to ~75% of icon size to fit nicely
        logo_sz = int(icon_sz * 0.75)
        scaled_logo = square_logo.resize((logo_sz, logo_sz), resample=resample_algo)
        mono_img.paste(scaled_logo, ((icon_sz - logo_sz) // 2, (icon_sz - logo_sz) // 2), scaled_logo)
        mono_img.save(os.path.join(density_dir, "ic_launcher.png"), format="PNG")

        # B. Round launcher icon (logo padded inside a circular brand-colored background)
        round_img = Image.new("RGBA", (icon_sz, icon_sz), (0, 0, 0, 0))
        mask = Image.new("L", (icon_sz, icon_sz), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, icon_sz - 1, icon_sz - 1), fill=255)
        
        circle_bg = Image.new("RGBA", (icon_sz, icon_sz), bg_color + (255,))
        round_img.paste(circle_bg, (0, 0), mask=mask)
        round_img.paste(scaled_logo, ((icon_sz - logo_sz) // 2, (icon_sz - logo_sz) // 2), scaled_logo)
        round_img.save(os.path.join(density_dir, "ic_launcher_round.png"), format="PNG")

        # C. Adaptive Launcher Foreground (transparent background, logo scaled to fit in central 66.6% safe zone)
        adaptive_fg = Image.new("RGBA", (adaptive_sz, adaptive_sz), (0, 0, 0, 0))
        # Keep inside safe zone (scale to 60% of adaptive_sz)
        fg_logo_sz = int(adaptive_sz * 0.60)
        scaled_fg_logo = square_logo.resize((fg_logo_sz, fg_logo_sz), resample=resample_algo)
        adaptive_fg.paste(scaled_fg_logo, ((adaptive_sz - fg_logo_sz) // 2, (adaptive_sz - fg_logo_sz) // 2), scaled_fg_logo)
        adaptive_fg.save(os.path.join(density_dir, "ic_launcher_foreground.png"), format="PNG")

    print("Android Launcher Icons successfully generated!")

    # Step 4: Generate Splash Screens
    print("Generating Android Splash Screens...")
    
    # Splash specifications: (directory, width, height)
    splash_specs = [
        # Default fallback
        ("drawable", 480, 320),
        # Landscapes
        ("drawable-land-mdpi", 320, 240),
        ("drawable-land-hdpi", 480, 320),
        ("drawable-land-xhdpi", 960, 720),
        ("drawable-land-xxhdpi", 1600, 960),
        ("drawable-land-xxxhdpi", 1920, 1280),
        # Portraits
        ("drawable-port-mdpi", 240, 320),
        ("drawable-port-hdpi", 320, 480),
        ("drawable-port-xhdpi", 720, 960),
        ("drawable-port-xxhdpi", 960, 1600),
        ("drawable-port-xxxhdpi", 1280, 1920),
    ]

    for dir_name, w, h in splash_specs:
        target_dir = os.path.join(res_base, dir_name)
        os.makedirs(target_dir, exist_ok=True)

        # Create base canvas with dark brand background
        splash_img = Image.new("RGBA", (w, h), bg_color + (255,))

        # Scale logo to ~35% of the minimum dimension of the screen
        min_dim = min(w, h)
        splash_logo_sz = int(min_dim * 0.35)
        scaled_splash_logo = square_logo.resize((splash_logo_sz, splash_logo_sz), resample=resample_algo)

        # Paste logo in the dead-center
        x = (w - splash_logo_sz) // 2
        y = (h - splash_logo_sz) // 2
        splash_img.paste(scaled_splash_logo, (x, y), scaled_splash_logo)

        # Save as PNG
        splash_img.save(os.path.join(target_dir, "splash.png"), format="PNG")

    print("Android Splash Screens successfully generated!")
    print("All tasks completed successfully!")

if __name__ == "__main__":
    main()
