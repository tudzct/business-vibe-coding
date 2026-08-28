import checkIcon from '../../assets/auth/check.svg';
import eyeOutline from '../../assets/auth/eye-outline.svg';
import eyePupil from '../../assets/auth/eye-pupil.svg';
import googleBlue from '../../assets/auth/google-blue.svg';
import googleGreen from '../../assets/auth/google-green.svg';
import googleRed from '../../assets/auth/google-red.svg';
import googleYellow from '../../assets/auth/google-yellow.svg';

export function EyeIcon() {
  return (
    <span aria-hidden="true" className="relative block size-6 overflow-hidden">
      <img alt="" className="absolute left-0.5 top-1 h-4 w-[22px]" src={eyeOutline} />
      <img alt="" className="absolute left-2 top-2 size-2" src={eyePupil} />
    </span>
  );
}

export function GoogleIcon() {
  return (
    <span aria-hidden="true" className="relative block size-6 overflow-hidden">
      {[googleBlue, googleGreen, googleYellow, googleRed].map((src) => (
        <img alt="" className="absolute inset-0 size-6" key={src} src={src} />
      ))}
    </span>
  );
}

export function CheckIcon() {
  return <img alt="" aria-hidden="true" className="size-5" src={checkIcon} />;
}
