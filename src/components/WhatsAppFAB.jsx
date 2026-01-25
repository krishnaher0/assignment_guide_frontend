import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppFAB() {
  const phoneNumber = '9779861544600';
  const message = 'Hi! I need help with my assignment.';

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="text-white text-2xl" />

      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-zinc-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with us
      </span>
    </a>
  );
}
