<script lang="ts">
  import LogoSvg1 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_1.svg";
  import LogoSvg2 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_2.svg";
  import LogoSvg3 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_3.svg";
  import LogoSvg4 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_4.svg";
  import LogoSvg5 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_5.svg";
  import LogoSvg6 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_6.svg";
  import LogoSvg7 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_7.svg";
  import LogoSvg8 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_8.svg";
  import LogoSvg9 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_9.svg";
  import LogoSvg10 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_10.svg";
  import LogoSvg11 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_11.svg";
  import LogoSvg12 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_12.svg";
  import LogoSvg13 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_13.svg";
  import LogoSvg14 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_14.svg";
  import LogoSvg15 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_15.svg";
  import LogoSvg16 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_16.svg";
  import LogoSvg17 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_17.svg";
  import LogoSvg18 from "../images/BP_FPDAO_Logo_BlackOnWhite_sRGB_18.svg";

  let logos = [
    LogoSvg1,
    LogoSvg2,
    LogoSvg3,
    LogoSvg4,
    LogoSvg5,
    LogoSvg6,
    LogoSvg7,
    LogoSvg8,
    LogoSvg9,
    LogoSvg10,
    LogoSvg11,
    LogoSvg12,
    LogoSvg13,
    LogoSvg14,
    LogoSvg15,
    LogoSvg16,
    LogoSvg17,
    LogoSvg18,
  ];

  // get random number between 1 and 18
  let randomLogo = logos[Math.floor(Math.random() * logos.length) + 1];
</script>

<img
  class="h-auto lg:max-h-28 w-full dark:invert dark:border-none"
  src={randomLogo}
  alt="fpdao logo"
>