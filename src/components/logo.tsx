import Image from 'next/image';
import type { FC } from 'react';

const Logo: FC = () => {
  return (
    <Image
      src="https://sites-wp-obdpro.vlxcg6.easypanel.host/wp-content/uploads/2025/12/OBD-pro-Branco.png"
      alt="OBD-Pro Logo"
      width={150}
      height={35}
      priority
      unoptimized
    />
  );
};

export default Logo;
