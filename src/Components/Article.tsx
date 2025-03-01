import React from 'react';

function Article() {
  return(
    <main className='w-full h-screen flex justify-center items-center'>
      <section className='max-w-6xl w-4/5 flex flex-row justify-evenly items-center flex-wrap gap-12 lg:gap-0'>
        <article className='w-96 lg:w-1/2 flex flex-col lg:pl-8 xl:pl-24 gap-2'>
          <h1 className='font-bold text-2xl sm:text-3xl pb-3 max-w-96'>
            Hi, I'm Maurício, a <span 
            className='bg-gradient-to-r from-sky-700 via-sky-500 to-sky-400 text-transparent bg-clip-text'>Software Engineer
            </span> and Full-Stack Web-developer
          </h1>
          <p className='text-gray-500 font-inter'>Graduated Web-developer from <a 
          href='https://www.senacrs.com.br/hotsite/ensinomedio/index.php' target='_blank' rel='noopener noreferrer'
          className='text-black font-inter'>Senac RS</a></p>
          <p className='text-gray-500 font-inter'>Majoring in Software Engineering at <a
          href='https://graduacao.unilasalle.edu.br/cursos-presencial/engenharia-de-software' target='_blank' rel='noopener noreferrer'
          className='text-black font-inter'>UniLaSalle</a></p>
        </article>
        <article className='w-96 lg:w-1/2 flex justify-center'>
          <img src='/Assets/hero.gif' alt='Foto de perfil'
          className='max-w-96 w-full max-h-96 h-full'/>
        </article>
      </section>
    </main>
  );
}

export default Article;