Thanks to Tomasz Czajęcki who wrote article about how to render font in WebGPU. I used his/her research / code.

Article is here - https://tchayen.com/drawing-text-in-webgpu-using-just-the-font-file

I had to modify code to:

- optimize font loading. Keep loaded font in memory to used it after canvas resizing
- fixed some critical issues with font rendering on retina and non-retina displays
