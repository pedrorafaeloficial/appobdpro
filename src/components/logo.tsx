import Image from 'next/image';
import type { FC } from 'react';

const Logo: FC = () => {
  return (
    <Image
      src="/src/OBD-pro-Branco.png"
      alt="OBD-Pro Logo"
      width={150}
      height={35}
      priority
      unoptimized
    />
  );
};

export default Logo;
