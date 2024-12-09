import { exit } from 'process'
import WelcomeEmail from '@/emails/welcome'
import { render } from '@react-email/components'
import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// const emails = [
//   'spotog160@gmail.com',
//   'fouadbenalayaaaaa@gmail.com',
//   'unsimplified123vk@gmail.com',
//   'waseemrind1981@gmail.com',
//   'belajarebay123@gmail.com',
//   'd.zoludev@gmail.com',
//   'cobyperkins100@gmail.com',
//   'javedali6016@gmail.com',
//   'realadrianwickens@gmail.com',
//   'nirendrajadhav521@gmail.com',
//   'dhello976@gmail.com',
//   'engeljaron7@gmail.com',
//   'anselmoonline15@gmail.com',
//   'jarrad.xyz@gmail.com',
//   'mdsabbiralom2004@gmail.com',
//   'csacsa741@gmail.com',
//   'bathsaltdonkeys@gmail.com',
//   'mcrorydeclan@gmail.com',
//   'kate240601@gmail.com',
//   'mmkahwaji05@gmail.com',
//   'aisejpg04@gmail.com',
//   'editoralperencatak@gmail.com',
//   'jeronimosanboni@gmail.com',
//   'jersonne1215@gmail.com',
//   'goatali448@gmail.com',
//   'botsote17@gmail.com',
//   'agustin.ahumada2704@gmail.com',
//   'funnyxthreads@gmail.com',
//   'josiahkalu524@gmail.com',
//   'aitoktik0000@gmail.com',
//   'yuliya.velibekova@bt-innovation.de',
//   'ungefugastra60@gmail.com'
// ]

const emails = ['hello@dillion.io']

const welcomeUsers = async () => {
  try {
    console.log('Sending welcome emails...')
    console.log(`Total users: ${emails.length}`)

    for (const email of emails) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'Clip Studio <team@transactions.clip.studio>',
          to: email,
          subject: 'Welcome to Clip Studio! 🎉',
          html: await render(WelcomeEmail({ userFirstname: 'Dillion' }))
        })

        if (error) {
          console.error(`Failed to send welcome email to ${email}:`, error)
          continue
        }

        console.log(`Successfully sent welcome email to ${email}`)
      } catch (err) {
        console.error(`Error sending to ${email}:`, err)
      }
    }

    console.log('Finished sending welcome emails')
    exit(0)
  } catch (error) {
    console.error('Error in welcome email process:', error)
    exit(1)
  }
}

welcomeUsers()
