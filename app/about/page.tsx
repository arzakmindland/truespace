import { FiBookOpen, FiUsers, FiAward, FiCode } from 'react-icons/fi'
import Link from 'next/link'

export const metadata = {
  title: 'О нас - TrueSpace',
  description: 'Узнайте больше о платформе TrueSpace и наших ценностях',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent mb-6">
            О платформе TrueSpace
          </h1>
          <p className="text-lg text-secondary max-w-3xl mx-auto">
            Образовательная платформа, соединяющая талантливых преподавателей и студентов в единое сообщество для обмена знаниями и опытом
          </p>
        </div>
        
        {/* Ценности */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard 
            icon={<FiBookOpen />}
            title="Качественные материалы"
            description="Наши курсы разработаны экспертами с многолетним опытом в своих областях"
          />
          <FeatureCard 
            icon={<FiUsers />}
            title="Сообщество"
            description="Присоединяйтесь к сообществу единомышленников для обмена опытом и знаниями"
          />
          <FeatureCard 
            icon={<FiAward />}
            title="Сертификаты"
            description="Получайте подтверждение своих навыков с помощью сертификатов о прохождении курсов"
          />
          <FeatureCard 
            icon={<FiCode />}
            title="Практические навыки"
            description="Фокус на практике и развитии реальных навыков, которые можно применить в работе"
          />
        </div>
        
        {/* Наша история */}
        <div className="bg-background-lighter rounded-lg p-8 shadow-subtle mb-16">
          <h2 className="text-2xl font-bold mb-6">Наша история</h2>
          <div className="prose prose-invert max-w-none">
            <p>
              TrueSpace появился в 2023 году как ответ на растущую потребность в качественном онлайн-образовании.
              Наша миссия — сделать профессиональные знания доступными для всех, кто стремится к развитию.
            </p>
            <p>
              Мы верим, что обучение должно быть не только полезным, но и увлекательным. Поэтому мы уделяем особое внимание качеству контента,
              интерактивности обучения и созданию сообщества вокруг наших курсов.
            </p>
            <p>
              Сегодня TrueSpace — это платформа, объединяющая тысячи студентов и десятки преподавателей со всего мира.
              Мы постоянно развиваемся, добавляя новые курсы и улучшая функциональность платформы.
            </p>
          </div>
        </div>
        
        {/* Команда */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-6">Наша команда</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TeamMember 
              name="Александр Иванов" 
              role="Основатель и CEO" 
              image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <TeamMember 
              name="Елена Петрова" 
              role="Руководитель отдела разработки" 
              image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <TeamMember 
              name="Михаил Сидоров" 
              role="Технический директор" 
              image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
          </div>
        </div>
        
        {/* Контакты */}
        <div className="bg-background-lighter rounded-lg p-8 shadow-subtle">
          <h2 className="text-2xl font-bold mb-6 text-center">Свяжитесь с нами</h2>
          <div className="text-center mb-8">
            <p className="text-secondary mb-4">У вас есть вопросы или предложения? Напишите нам!</p>
            <Link href="mailto:info@truespace.example.com" className="text-accent hover:text-accent-light">
              info@truespace.example.com
            </Link>
          </div>
          <div className="flex justify-center">
            <Link href="/courses" className="btn-primary mr-4">
              Начать обучение
            </Link>
            <Link href="/contact" className="btn-secondary">
              Связаться с нами
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-background-lighter p-6 rounded-lg shadow-subtle">
      <div className="p-3 bg-accent/10 text-accent rounded-lg inline-block mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-secondary">{description}</p>
    </div>
  )
}

function TeamMember({ name, role, image }: { name: string, role: string, image: string }) {
  return (
    <div>
      <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-2 border-accent/30">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/128x128?text=TrueSpace"
          }}
        />
      </div>
      <h3 className="text-lg font-medium">{name}</h3>
      <p className="text-secondary">{role}</p>
    </div>
  )
} 