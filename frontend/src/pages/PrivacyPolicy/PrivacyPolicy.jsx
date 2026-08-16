import { Link } from 'react-router-dom';
import '../../styles/legal.css';

export default function PrivacyPolicy() {
    return (
        <div className="container page legal">
            <h1 className="page__title">Privacy Policy</h1>
            <p className="legal__updated">Last updated: 17 August 2026</p>

            <p className="legal__intro">
                We respect your privacy and are committed to protecting the personal information you share
                with us. This policy explains what information we collect, why we collect it, and how you
                can manage your information when using our marketplace.
            </p>

            <h2>1. Information you provide</h2>
            <p>
                When you create an account or use our marketplace, you may provide information such as your
                name, email address, username, profile picture, location, and other profile details.
                Information is also collected when you create listings, upload images, contact other users,
                place bids, save items, or otherwise interact with the platform.
            </p>

            <h2>2. Information collected automatically</h2>
            <p>
                We may collect limited technical information when you access the website. This can include
                your IP address, browser type, device information, pages visited, and basic usage data.
                This information helps us understand how the website is used and allows us to maintain its
                security and functionality.
            </p>

            <h2>3. How we use information</h2>
            <p>Your information may be used to:</p>
            <ul>
                <li>Provide and maintain your marketplace account.</li>
                <li>Process listings, purchases, bids, favourites, and other marketplace activity.</li>
                <li>Allow users to communicate with one another.</li>
                <li>Personalise and improve the marketplace experience.</li>
                <li>Detect fraud, spam, abuse, and other suspicious activity.</li>
                <li>Send service notifications and important account updates.</li>
                <li>Maintain the security and reliability of our systems.</li>
            </ul>

            <h2>4. Information shared with other users</h2>
            <p>
                The marketplace is designed to allow users to buy and sell items with one another.
                Information included in your public profile and listings, such as your username, profile
                picture, listing description, images, location, and ratings, may therefore be visible to
                other users.
            </p>

            <p>
                We do not make your password or private account credentials publicly available.
                Conversations between users should also be treated as private and should not contain
                sensitive personal information.
            </p>

            <h2>5. Third-party services</h2>
            <p>
                We may use third-party providers for services such as hosting, analytics, email delivery,
                security, and payment or credit processing. These providers only receive information
                necessary for them to perform the services they provide to us and are expected to handle
                that information appropriately.
            </p>

            <h2>6. Cookies and similar technologies</h2>
            <p>
                We may use cookies or similar technologies to keep you signed in, remember preferences,
                understand website usage, and improve the performance of the platform. You can control
                cookies through your browser settings, although disabling certain cookies may affect some
                features of the website.
            </p>

            <h2>7. Data security</h2>
            <p>
                We take reasonable measures to protect your information from unauthorised access, loss,
                misuse, or alteration. However, no online service can guarantee complete security, and you
                should use a strong, unique password and avoid sharing your account credentials with others.
            </p>

            <h2>8. How long we keep your information</h2>
            <p>
                We keep personal information for as long as necessary to provide our services and fulfil
                the purposes described in this policy. Some information may be retained for longer where
                required by law, needed to resolve disputes, or necessary to prevent fraud and abuse.
            </p>

            <h2>9. Your rights</h2>
            <p>
                Depending on where you live, you may have rights to access, correct, export, or delete
                personal information we hold about you. You may also be able to object to or restrict
                certain uses of your information.
            </p>

            <p>
                To ask about your personal information or request changes or deletion, contact us at{' '}
                <a href="mailto:privacy@marketplace.example">privacy@marketplace.example</a>.
            </p>

            <h2>10. Children's privacy</h2>
            <p>
                Our marketplace is not intended for children who are not legally permitted to use online
                marketplace services. We do not knowingly collect personal information from children in
                violation of applicable laws.
            </p>

            <h2>11. Changes to this policy</h2>
            <p>
                We may update this Privacy Policy from time to time. Any changes will be posted on this
                page, together with a new “Last updated” date. We encourage you to review the policy
                periodically.
            </p>

            <h2>Contact us</h2>
            <p>
                If you have any questions about this Privacy Policy or how your information is handled,
                contact us at{' '}
                <a href="mailto:privacy@marketplace.example">privacy@marketplace.example</a>.
            </p>

            <p>
                For more information about using the marketplace, please read our{' '}
                <Link to="/terms">Terms of Service</Link>.
            </p>
        </div>
    );
}