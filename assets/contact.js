const form = document.querySelector('[data-contact-form]');
if (form) {
  const lang = ['tr', 'en', 'de', 'ru', 'sv', 'nb', 'da'].includes(document.documentElement.lang) ? document.documentElement.lang : 'tr';
  const copy = {
    tr: {
      busy: 'Gönderiliyor…', send: 'Mesajı gönder',
      local: 'Yerel önizlemede e-posta gönderimi etkin değil. Mesajınız gönderilmedi. Doğrudan e-posta bağlantısını kullanabilirsiniz.',
      unavailable: 'E-posta gönderimi henüz etkinleştirilmedi. Mesajınız gönderilmedi; lütfen doğrudan e-posta ile yazın.',
      fail: 'Mesaj gönderilemedi. Lütfen tekrar deneyin veya doğrudan e-posta ile yazın.',
      success: 'Mesajınız e-posta gönderim hizmetine iletildi.',
      invalid: 'Lütfen alanları kontrol edin; mesaj en az 10 karakter olmalıdır.'
    },
    en: {
      busy: 'Sending…', send: 'Send message',
      local: 'Email delivery is not enabled in this local preview. Your message has not been sent. You can use the direct email link.',
      unavailable: 'Email delivery has not been enabled yet. Your message has not been sent; please email us directly.',
      fail: 'Your message could not be sent. Please try again or email us directly.',
      success: 'Your message has been accepted by the email delivery service.',
      invalid: 'Please check the fields; your message must contain at least 10 characters.'
    },
    de: {
      busy: 'Wird gesendet…', send: 'Nachricht senden',
      local: 'In dieser lokalen Vorschau ist der E-Mail-Versand nicht aktiviert. Ihre Nachricht wurde nicht gesendet. Bitte verwenden Sie den direkten E-Mail-Link.',
      unavailable: 'Der E-Mail-Versand ist noch nicht aktiviert. Ihre Nachricht wurde nicht gesendet. Bitte schreiben Sie uns direkt per E-Mail.',
      fail: 'Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt per E-Mail.',
      success: 'Ihre Nachricht wurde vom E-Mail-Versanddienst angenommen.',
      invalid: 'Bitte prüfen Sie die Felder. Ihre Nachricht muss mindestens 10 Zeichen enthalten.'
    },
    ru: {
      busy: 'Отправка…', send: 'Отправить сообщение',
      local: 'В локальной версии отправка писем не включена. Ваше сообщение не отправлено. Воспользуйтесь прямой ссылкой электронной почты.',
      unavailable: 'Отправка писем ещё не включена. Ваше сообщение не отправлено. Пожалуйста, напишите нам по электронной почте.',
      fail: 'Не удалось отправить сообщение. Повторите попытку или напишите нам по электронной почте.',
      success: 'Ваше сообщение принято сервисом отправки электронной почты.',
      invalid: 'Проверьте поля. Сообщение должно содержать не менее 10 символов.'
    },
    sv: {
      busy: 'Skickar…', send: 'Skicka meddelande',
      local: 'E-postutskick är inte aktiverat i den lokala förhandsvisningen. Ditt meddelande har inte skickats. Du kan använda e-postlänken.',
      unavailable: 'E-postutskick är inte aktiverat ännu. Ditt meddelande har inte skickats; mejla oss direkt.',
      fail: 'Meddelandet kunde inte skickas. Försök igen eller mejla oss direkt.',
      success: 'Ditt meddelande har tagits emot av e-posttjänsten.',
      invalid: 'Kontrollera fälten; meddelandet måste innehålla minst 10 tecken.'
    },
    nb: {
      busy: 'Sender…', send: 'Send melding',
      local: 'E-postutsending er ikke aktivert i den lokale forhåndsvisningen. Meldingen din er ikke sendt. Du kan bruke e-postlenken.',
      unavailable: 'E-postutsending er ikke aktivert ennå. Meldingen din er ikke sendt; send oss en e-post direkte.',
      fail: 'Meldingen kunne ikke sendes. Prøv igjen eller send oss en e-post direkte.',
      success: 'Meldingen din er mottatt av e-posttjenesten.',
      invalid: 'Kontroller feltene; meldingen må inneholde minst 10 tegn.'
    },
    da: {
      busy: 'Sender…', send: 'Send besked',
      local: 'Udsendelse af e-mails er ikke aktiveret i den lokale forhåndsvisning. Din besked er ikke sendt. Du kan bruge e-maillinket.',
      unavailable: 'Udsendelse af e-mails er ikke aktiveret endnu. Din besked er ikke sendt; skriv direkte til os.',
      fail: 'Beskeden kunne ikke sendes. Prøv igen, eller skriv direkte til os.',
      success: 'Din besked er modtaget af e-mailtjenesten.',
      invalid: 'Kontrollér felterne; beskeden skal indeholde mindst 10 tegn.'
    }
  }[lang];
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[role="status"]');
  const draft = form.dataset.mailMode === 'draft';
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname) || location.protocol === 'file:';
  button.disabled = false;
  if (local || draft) document.querySelector('[data-preview-mail]').hidden = false;
  if (draft) button.textContent = {tr:'E-posta taslağı oluştur',en:'Create email draft',de:'E-Mail-Entwurf erstellen',ru:'Создать черновик письма',sv:'Skapa e-postutkast',nb:'Lag e-postutkast',da:'Opret e-mailudkast'}[lang];
  let pending = false;
  let submissionId = crypto.randomUUID();
  form.addEventListener('input', () => { status.textContent = ''; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const data = Object.fromEntries(['name', 'email', 'subject', 'message', 'website'].map(key => [key, String(fields.get(key) || '').trim()]));
    if (data.name.length < 2 || data.message.length < 10) {
      status.textContent = copy.invalid;
      return;
    }
    if (draft) {
      const subject = data.subject || 'Sağır Hukuk Bürosu — iletişim';
      const body = `${data.name}\n${data.email}\n\n${data.message}`;
      location.href = `mailto:alihansagir@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = {tr:'Taslak e-posta uygulamanızda açılır. Gönderimi oradan tamamlayın; bu site mesajınızı göndermedi.',en:'A draft opens in your email application. Send it from there; this site has not sent your message.',de:'Der Entwurf wird im E-Mail-Programm geöffnet. Bitte senden Sie ihn dort ab; die Website hat keine Nachricht versendet.',ru:'Черновик открывается в почтовом приложении. Отправьте его там; сайт не отправлял сообщение.',sv:'Utkastet öppnas i ditt e-postprogram. Skicka det därifrån; webbplatsen har inte skickat ditt meddelande.',nb:'Utkastet åpnes i e-postprogrammet ditt. Send det derfra; nettstedet har ikke sendt meldingen din.',da:'Udkastet åbnes i dit e-mailprogram. Send det derfra; hjemmesiden har ikke sendt din besked.'}[lang];
      return;
    }
    if (local) { status.textContent = copy.local; return; }
    pending = true;
    button.disabled = true;
    button.textContent = copy.busy;
    form.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(form.getAttribute('action') || '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, consent: fields.get('consent') === 'on', lang, submissionId }),
        signal: AbortSignal.timeout(15000)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        status.textContent = result.code === 'NOT_CONFIGURED' ? copy.unavailable : copy.fail;
      } else {
        status.textContent = copy.success;
        form.reset();
        submissionId = crypto.randomUUID();
      }
    } catch {
      status.textContent = copy.fail;
    } finally {
      pending = false;
      button.disabled = false;
      button.textContent = copy.send;
      form.removeAttribute('aria-busy');
    }
  });
}
