# Author's Notes
SibeiSafe was built to explore how to implement a zero-knowledge architecture, cloud development and applied cryptography. 

### Where it started
This project started out as a script `crypto.py` to understand AES-256, PBKDF2 key derivation, and SHA-256 integrity checking from the inside rather than just importing a library. It taught me things like how salt can ensure uniqueness to the ciphertext, how hashing is used to verify file integrity, how keys are derived from passwords through many iterations to ensure a cryptographically secure key.

### Full Stack & Cloud Development
I felt a script that only I can run on my machine, isn't a viable way to securely store or share files. So, I decided to pivot into web-development. Learning Flask to build out the API backend, React to design the user interface, and PostgreSQL for the database. The application was then moved to AWS for production, utilizing EC2 for computing, S3 for storing encrypted files, Nginx reverse proxy to enforce HTTPS, manage traffic, and shield the backend from the public network. Building this provided me with hands-on experience in:
- **Full-Stack Development**: Communication between Frontend, Backend, and Database.
- **Networking**: Configuring reverse proxy and understanding how network traffic flows
- **Cloud Infrastructure**: How to use AWS as a replacement for conventional servers.
- **Security**: Authentication using JWT and principle of least privilege in action.

### Zero-Knowledge Refactor
After deploying the app, I continued to research how enterprise platforms secure user data, specifically Google Drive's key-pair database and ProtonDrive's DEK/KEK architecture. It was then I realised server-side encryption was a security flaw. So, to achieve true zero-knowledge security, the entire encryption pipeline was refactored via client-side encryption. The cryptographic process happens entirely within the user's browser, ensuring the backend never processes or intercepts plaintext passwords or raw user data.

### Frontend Design Process & UI Polish

Since my focus for this project was cryptography and cloud infrastructure, I wanted to accelerate the frontend development without sacrificing the user experience.

I started by designing what I wanted the UI to look like using Canva. Once the pages design was confirmed, I used Gemini to build the initial React code, providing specific prompts detailing the exact button behaviors, state changes, and CSS transitions I needed. While the AI-generated code works, it still required much refactoring to make it more readable and sustainable. For example:

- **Component Architecture:** The initial code did not make use of React's component architecture effectively, stuffing all the logic into a single file. I refactored this by extracting elements like the offcanvas menus into their own React components.

- **UI Responsivity:** The generated code contained some responsivity issues. For instance it generated a raw flexbox logo that would clash and overlap with the login/register forms when resizing the window. I stripped out the flexbox and implemented a Navbar which handles responsive collapsing on smaller screens.

- **Custom Styling:** I layered in my own custom Bootstrap 5 styling and polished the final CSS to ensure the interface was clean, responsive, and aligned with my original Canva designs.