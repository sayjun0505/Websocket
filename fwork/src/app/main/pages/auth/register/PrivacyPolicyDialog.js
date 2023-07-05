import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export default function PrivacyPolicyDialog(props) {
  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (props.open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.open]);

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Privacy Policy</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            <Typography className="mb-10 font-bold print:mb-30" variant="body1">
              FOXCONNECT PRIVACY POLICY
            </Typography>
            <div className="flex">
              <Typography
                className="font-normal mb-10 px-0"
                variant="caption"
                color="textSecondary"
              >
                We at Foxconnect know you care about how your personal
                information is used and shared, and we take your privacy
                seriously. Please read the following to learn more about our
                Privacy Policy. By using or accessing the Services in any
                manner, you acknowledge that you accept the practices and
                policies outlined in this Privacy Policy, and you hereby consent
                that we will collect, use, and share your information in the
                following ways.
              </Typography>
            </div>

            <Typography className="mb-10 font-bold print:mb-30" variant="body1">
              What does this privacy policy over?
            </Typography>
            <div className="flex">
              <Typography
                className="font-normal mb-10 px-0"
                variant="caption"
                color="textSecondary"
              >
                This Privacy Policy covers our treatment of personally
                identifiable information (“Personal Information”) that we gather
                when you are accessing or using our Services, but not to the
                practices of companies we don’t own or control, or people that
                we don’t manage. We gather various types of Personal Information
                from our users, as explained in more detail below, and we use
                this Personal Information internally in connection with our
                Services, including to personalize, provide, and improve our
                services, to allow you to set up a user account and profile, to
                contact you and allow other users to contact you, to fulfill
                your requests for certain products and services, and to analyze
                how you use the Services. In certain cases, we may also share
                some Personal Information with third parties, but only as
                described below. As noted in the Terms of Use, we do not
                knowingly collect or solicit personal information from anyone
                under the age of 13. If you are under 13, please do not attempt
                to register for the Services or send any personal information
                about yourself to us. If we learn that we have collected
                personal information from a child under age 13, we will delete
                that information as quickly as possible. If you believe that a
                child under 13 may have provided us personal information, please
                contact us at support@foxconnect.app
              </Typography>
            </div>

            <Typography className="mb-10 font-bold print:mb-30" variant="body1">
              Will Foxconnect ever change this privacy policy
            </Typography>

            <div className="flex">
              <Typography
                className="font-normal mb-10 px-0"
                variant="caption"
                color="textSecondary"
              >
                We’re constantly trying to improve our Services, so we may need
                to change this Privacy Policy from time to time as well, but if
                we do we will alert you to changes by placing a notice on
                Foxconnect.app, by sending you an email, by posting the revised
                Privacy Policy and revising the date at the top of the Privacy
                Policy, and/or by some other means. Please note that if you’ve
                opted not to receive legal notice emails from us (or you haven’t
                provided us with your email address), those legal notices will
                still govern your use of the Services, and you are still
                responsible for reading and understanding them. If you use the
                Services after any changes to the Privacy Policy have been
                posted, that means you agree to all of the changes.
              </Typography>
            </div>

            <Typography className="mb-10 font-bold print:mb-30" variant="body1">
              What information does Foxconnect collect?
            </Typography>

            <div className="flex">
              <Typography
                className="font-normal mb-10 px-0"
                variant="caption"
                color="textSecondary"
              >
                Information You Provide to Us: We receive and store any
                information you knowingly provide to us. For example, through
                the registration process and/or through your account settings,
                we may collect Personal Information such as your name, profile
                picture, email address, phone number, gender, time zone,
                information about pages that you create chatbot. Also if you use
                any chatbot create in the Foxconnect, our platform will collect
                information such as, but not limited to, your name, gender,
                profile picture, and time zone. If you provide your third-party
                account credentials to us or otherwise sign in to the Services
                through a third party site or service, you understand some
                content and/or information in those accounts (“Third Party
                Account Information”) may be transmitted into your account with
                us, and that Third Party Account Information transmitted to our
                Services is covered by this Privacy Policy. Certain information
                may be required to register with us or to take advantage of some
                of our features. Information Collected Automatically: Whenever
                you interact with our Services, we automatically receive and
                record information on our server logs from your browser or
                device, which may include your internet protocol (“IP”) address,
                geolocation data, device identification, “cookie” information,
                the type of browser and/or device you’re using to access our
                Services, and the page or feature you requested. “Cookies” are
                identifiers we transfer to your browser or device that allow us
                to recognize your browser or device and tell us how and when
                pages and features in our Services are visited and by how many
                people. You may be able to change the preferences on your
                browser or device to prevent or limit your device’s acceptance
                of cookies, but this may prevent you from taking advantage of
                some of our features. We may use third parties to provide
                analytics services. These entities may use cookies, web beacons
                and other technologies to collect information about your use of
                the Services and other websites, including your IP address, web
                browser, pages viewed, time spent on pages, links clicked and
                conversion information. This information may be used by
                Foxconnect and others to, among other things, analyze and track
                data, determine the popularity of certain content, customize the
                Services, deliver content targeted to your interests on our
                Services and other websites and better understand your online
                activity. For example, we use Google Analytics, a web analytics
                service provided by Google, Inc. ("Google"). Google Analytics
                uses cookies to help us analyze how users use the Services and
                enhance your experience when you use the Services. For more
                information on how Google uses this data, go to
                www.google.com/policies/privacy/partners. If you click on a link
                to a third party website or service, a third party may also
                transmit cookies to you. Again, this Privacy Policy does not
                cover the use of cookies by any third parties, and we aren’t
                responsible for their privacy policies and practices. Please be
                aware that cookies placed by third parties may continue to track
                your activities online even after you have left our Services,
                and those third parties may not honor “Do Not Track” requests
                you have set using your browser or device. We may use this data
                to customize content for you that we think you might like, based
                on your usage patterns. We may also use it to improve the
                Services – for example, this data can tell us how often users
                use a particular feature of the Services, and we can use that
                knowledge to make the Services interesting to as many users as
                possible. Information Collected from Other Websites and Do Not
                Track Policy: Through cookies we place on your browser or
                device, we may collect information about your online activity
                after you leave our Services. Just like any other usage
                information we collect, this information allows us to improve
                the Services and customize your online experience, and otherwise
                as described in this Privacy Policy. Your browser may offer you
                a “Do Not Track” option, which allows you to signal to operators
                of websites and web applications and services (including
                behavioral advertising services) that you do not wish such
                operators to track certain of your online activities over time
                and across different websites. Our Services do not support Do
                Not Track requests at this time, which means that we collect
                information about your online activity while you are using the
                Services and after you leave our Services.
              </Typography>
            </div>

            <Typography className="mb-10 font-bold print:mb-30" variant="body1">
              Will Foxconnect share any of the personal information it receives?
            </Typography>

            <div className="flex">
              <Typography
                className="font-normal mb-10 px-0"
                variant="caption"
                color="textSecondary"
              >
                We do not rent or sell your Personal Information in personally
                identifiable form to anyone, except as expressly provided below.
                We may share your Personal Information with third parties as
                described in this section: Information that’s been
                de-identified: We may de-identify your Personal Information so
                that you are not identified as an individual, and provide that
                information to our partners. We may also provide aggregate usage
                information to our partners (or allow partners to collect that
                information from you), who may use such information to
                understand how often and in what ways people use our Services,
                so that they, too, can provide you with an optimal online
                experience. However, we never disclose aggregate usage or
                de-identified information to a partner (or allow a partner to
                collect such information) in a manner that would identify you as
                an individual person. Affiliated Businesses: In certain
                situations, businesses or third party websites we’re affiliated
                with may sell or provide products or services to you through or
                in connection with the Services (either alone or jointly with
                us). You can recognize when an affiliated business is associated
                with such a transaction or service, and we will share your
                Personal Information with that affiliated business only to the
                extent that it is related to such transaction or service. One
                such service may include the ability for you to automatically
                transmit Third Party Account Information to your Services
                profile or to automatically transmit information in your
                Services profile to your third party account. We have no control
                over the policies and practices of third party websites or
                businesses as to privacy or anything else, so if you choose to
                take part in any transaction or service relating to an
                affiliated website or business, please review all such business’
                or websites’ policies. Agents: We employ other companies and
                people to perform tasks on our behalf and need to share your
                information with them to provide products or services to you.
                Unless we tell you differently, our agents do not have any right
                to use the Personal Information we share with them beyond what
                is necessary to assist us. Business Transfers: We may choose to
                buy or sell assets, and may share and/or transfer customer
                information in connection with the evaluation of and entry into
                such transactions. Also, if we (or our assets) are acquired, or
                if we go out of business, enter bankruptcy, or go through some
                other change of control, Personal Information could be one of
                the assets transferred to or acquired by a third party.
                Protection of Company and Others: We reserve the right to
                access, read, preserve, and disclose any information that we
                believe is necessary to comply with law or court order; enforce
                or apply our Terms of Use and other agreements; or protect the
                rights, property, or safety of Foxconnect, our employees, our
                users, or others.
              </Typography>
            </div>

            <Typography className="mb-10 font-bold print:mb-30" variant="body1">
              Is personal information about me secure?
            </Typography>

            <div className="flex">
              <Typography
                className="font-normal mb-10 px-0"
                variant="caption"
                color="textSecondary"
              >
                Your account is protected via Facebook authentication for your
                privacy and security. You must prevent unauthorized access to
                your account and Personal Information by selecting and
                protecting your Facebook account. We cannot control the actions
                of other users with whom you share your Facebook account. We
                endeavor to protect the privacy of your account and other
                Personal Information we hold in our records, but unfortunately,
                we cannot guarantee complete security. Unauthorized entry or
                use, hardware or software failure, and other factors, may
                compromise the security of user information at any time. You
                should also report any security violation to us at
                support@foxconnect.app
              </Typography>
            </div>

            <Typography className="mb-10 font-bold print:mb-30" variant="body1">
              What choices do I have
            </Typography>

            <div className="flex">
              <Typography
                className="font-normal mb-10 px-0"
                variant="caption"
                color="textSecondary"
              >
                You can always opt not to disclose information to us, but keep
                in mind some information may be needed to register with us or to
                take advantage of some of our features. You may be able to add,
                update, or delete information and adjust your privacy settings
                as explained above. When you update information, however, we may
                maintain a copy of the unrevised information in our records. You
                may request deletion of your account by contacting us at
                support.foxconnect.app. If you wish to delete your account you
                can also do so from Settings {'>'} Delete Account, but note that
                we may retain certain information as required by law or for
                legitimate business purposes. We may use any aggregated data
                derived from or incorporating your Personal Information after
                you update or delete it, but not in a manner that would identify
                you personally.
              </Typography>
            </div>

            <Typography className="mb-10 font-bold print:mb-30" variant="body1">
              What if I have questions about this policy?
            </Typography>

            <div className="flex">
              <Typography
                className="font-normal mb-10 px-0"
                variant="caption"
                color="textSecondary"
              >
                If you have any questions or concerns regarding our privacy
                policies, please send us a detailed message to
                support@foxconnect.app, and we will try to resolve your
                concerns.
              </Typography>
            </div>

            {/* <FormControl component="fieldset">
              <FormGroup aria-label="position" row>
                <FormControlLabel
                  value="end"
                  control={<Checkbox color="primary" />}
                  label="I have accepted the Terms and Conditions, Privacy and Policy."
                  labelPlacement="end"
                />
              </FormGroup>
            </FormControl> */}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
