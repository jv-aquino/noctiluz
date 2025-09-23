import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from '@/assets/hero-bg.png';

function Hero() {
  return (
    <section className="pt-36 relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div 
        className="absolute inset-0 opacity-30 blur-xs"
        style={{
          backgroundImage: `url(${heroImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/25 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="container relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]">
          <span className="text-foreground">Domine as </span>
          <span className="gradient-primary bg-clip-text text-transparent">
            Exatas
          </span>
          <br />
          <span className="text-foreground">no </span>
          <span className="gradient-primary bg-clip-text text-transparent">
            seu tempo
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-3xl mx-auto leading-[1.45]">
          Plataforma educacional personalizada para estudantes de ensino superior. 
          Aprenda matemática, física e engenharia com aulas interativas, feedbacks personalizados e questões resolvidas.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" className="text-lg px-8 py-3 shadow-primary/25 hover:shadow-xl group">
            Começar Gratuitamente
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-3 group">
            <Play className="mr-2 h-5 w-5" />
            Explorar Cursos
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Questões Resolvidas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50+</div>
            <div className="text-muted-foreground">Cursos Disponíveis</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">10k+</div>
            <div className="text-muted-foreground">Estudantes Ativos</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;