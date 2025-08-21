import Image from "next/image";
import LogoIcon from "../../../../public/images/logos/logo-with-dora-text.png";
import DotWaveBlackTop from "../../../../public/images/background/dot-black-top.png";
import DotWaveBlackBottom from "../../../../public/images/background/dot-black-bottom.png";
import DotWhite from "../../../../public/images/background/white-dot-1.png";
import SuccessImage from "../../../../public/images/assets/success-image.png";

export default function TransactionSuccess() {
  return (
    <div className="bg-white w-full min-h-screen mx-auto overflow-hidden flex flex-col">
      <div className="bg-gradient-to-tr from-[#2F49B3] via-[#1A308F] to-[#001363] md:ps-10 py-1 flex items-center rounded-b-2xl relative">
        <Image src={LogoIcon} alt="Logo" height={50} />
        <div className="absolute top-1 right-0 rotate-1">
          <Image
            src={DotWhite}
            alt="Dot White"
            className="h-24 md:h-[100px] w-auto"
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center relative px-8">
        <div className="absolute top-0 right-0">
          <Image
            src={DotWaveBlackTop}
            alt="Logo"
            className="h-32 md:h-[290px] lg:h-[380px] w-auto"
          />
        </div>
        <div className="absolute bottom-0 left-0">
          <Image
            src={DotWaveBlackBottom}
            alt="Logo"
            className="h-40 md:h-[290px] lg:h-[620px] w-auto"
          />
        </div>

        <Image
          src={SuccessImage}
          alt="Transaction Success"
          width={350}
          height={350}
          className="mb-6
            w-[70%] md:w-[20%]
          "
        />
        <h2 className="text-xl md:text-3xl font-bold text-[#001363] mb-4 text-center">
          Transaction Success!
        </h2>
        <p className="text-sm md:text-lg text-[#00000080] text-center max-w-5xl mb-4">
          Your transaction has been successfully completed. Thank you for your
          payment and trust in our service.
          <br />
          A confirmation of your transaction has been sent to your email. If you
          have any questions or need further assistance, please contact our
          support team.
          <br />
          You can now safely close this page or return to your WhatsApp to
          continue your activities.
        </p>
      </div>
    </div>
  );
}
