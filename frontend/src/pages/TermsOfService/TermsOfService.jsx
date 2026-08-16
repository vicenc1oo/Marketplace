import { Link } from 'react-router-dom';
import '../../styles/legal.css';

export default function TermsOfService() {
    return (
        <div className="container page legal">
            <h1 className="page__title">Terms of Service</h1>
            <p className="legal__updated">Last updated: 17 August 2026</p>

            <p className="legal__intro">
                Welcome to our marketplace. These Terms of Service set out the rules that apply when you
                create an account, list an item, communicate with other users, or buy and sell through the
                platform. By using the service, you agree to follow these Terms.
            </p>

            <h2>1. Using the marketplace</h2>
            <p>
                You must provide truthful and up-to-date information when creating an account. You are
                responsible for keeping your login details confidential and for all activity carried out
                through your account. You must also meet the minimum legal age required to use the service
                in your country.
            </p>

            <h2>2. Selling items</h2>
            <p>
                Sellers are responsible for the items they advertise and for making sure their listings are
                accurate. Information such as the item's condition, price, description, availability, and
                images should not be misleading.
            </p>

            <ul>
                <li>Only list items that you have the right to sell.</li>
                <li>Do not upload misleading, fraudulent, or stolen content.</li>
                <li>Do not list illegal, dangerous, counterfeit, or prohibited products.</li>
                <li>Keep listings updated when an item is no longer available.</li>
                <li>Honour agreements made with buyers through the marketplace.</li>
            </ul>

            <h2>3. Purchases and transactions</h2>
            <p>
                Our marketplace connects buyers and sellers but does not generally act as the seller of
                listed products. Buyers are responsible for reviewing a listing carefully and asking
                questions before agreeing to a transaction.
            </p>

            <p>
                Unless a specific feature states otherwise, payment, collection, delivery, and the final
                exchange of an item are arrangements between the buyer and seller. We recommend checking
                the item before completing a transaction and using safe meeting locations when meeting in
                person.
            </p>

            <h2>4. Auctions and bids</h2>
            <p>
                Some listings may be offered through an auction. When you submit a bid, you should only do
                so if you are prepared to complete the purchase if your bid wins. When the auction ends,
                the winning bidder may be expected to proceed with the transaction according to the listing
                terms.
            </p>

            <p>
                Sellers must not manipulate their own auctions, create fake bids, or otherwise attempt to
                artificially increase an item's price.
            </p>

            <h2>5. Communication and user behaviour</h2>
            <p>
                Users are expected to communicate respectfully and use the platform for legitimate
                marketplace activity. Harassment, threats, discrimination, spam, scams, impersonation, and
                deliberately misleading other users are not permitted.
            </p>

            <h2>6. Prohibited activity</h2>
            <p>You must not use the service to:</p>
            <ul>
                <li>Break applicable laws or regulations.</li>
                <li>Sell or promote prohibited or unlawful goods.</li>
                <li>Attempt to access another user's account or private information.</li>
                <li>Interfere with the operation or security of the website.</li>
                <li>Use automated systems to abuse, scrape, or overload the platform.</li>
                <li>Create accounts or listings for fraudulent or deceptive purposes.</li>
            </ul>

            <h2>7. Listing promotions and credits</h2>
            <p>
                The marketplace may offer optional promotional features that increase the visibility of
                listings. Any virtual credits used for these features are intended only for use within the
                platform and do not represent money or a cash-equivalent balance.
            </p>

            <p>
                Purchasing a promotion does not guarantee views, enquiries, bids, or a completed sale.
                Promotional features may be subject to specific duration, availability, or usage limits.
            </p>

            <h2>8. Content you upload</h2>
            <p>
                You retain responsibility for the photos, descriptions, messages, and other content you
                submit. By uploading content, you confirm that you have the necessary rights to use it and
                that it does not violate these Terms or the rights of another person.
            </p>

            <h2>9. Moderation and account restrictions</h2>
            <p>
                We may review, hide, remove, or restrict content and accounts when we reasonably believe
                they violate these Terms, applicable law, or the safety of the marketplace. Serious or
                repeated violations may result in suspension or permanent removal of an account.
            </p>

            <h2>10. Marketplace availability</h2>
            <p>
                We aim to keep the service available and reliable, but we cannot guarantee uninterrupted
                access. Features may occasionally be changed, temporarily unavailable, or discontinued in
                order to maintain or improve the platform.
            </p>

            <h2>11. Responsibility and liability</h2>
            <p>
                Users are responsible for their own transactions and interactions with other users. To the
                extent permitted by applicable law, we are not responsible for the condition, authenticity,
                legality, ownership, delivery, or safety of items listed by users, nor for disputes arising
                directly between buyers and sellers.
            </p>

            <h2>12. Changes to these Terms</h2>
            <p>
                We may revise these Terms when necessary to reflect changes to the marketplace, its
                features, or applicable requirements. Updated Terms will be published on this page and the
                date at the top will be changed accordingly. Your continued use of the service after an
                update indicates acceptance of the revised Terms.
            </p>

            <h2>13. Contact</h2>
            <p>
                If you have questions about these Terms or need to report an issue, contact us at{' '}
                <a href="mailto:support@marketplace.example">support@marketplace.example</a>.
            </p>

            <p>
                For information about how we collect and use personal information, please read our{' '}
                <Link to="/privacy">Privacy Policy</Link>.
            </p>
        </div>
    );
}