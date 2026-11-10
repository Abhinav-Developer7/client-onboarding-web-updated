import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { completeOnboardingSubmissionSchema } from '../../validators/onboardingSchemas';
import { Stepper } from '../../components/Stepper/Stepper';
import { Step1Customer } from './Step1Customer';
import { Step2TaxAddress } from './Step2TaxAddress';
import { Step3Contact } from './Step3Contact';
import { Step4Review } from './Step4Review';
import { OnboardingIntro } from './OnboardingIntro';
import { apiService } from '../../services/api';
import { clearDraft, loadDraft, saveDraft } from '../../utils/onboardingDraft';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import guideStep1 from '../../assets/onboarding/guide-step-1.png';
import guideStep2 from '../../assets/onboarding/guide-step-2.png';
import guideStep3 from '../../assets/onboarding/guide-step-3.png';
import guideStep4 from '../../assets/onboarding/guide-step-4.png';
import './OnboardingWizard.css';

const INTRO_HOLD_MS = 2800;
const INTRO_LEAVE_MS = 380;

const STEPS = [
  { id: 'customer', title: 'Customer & Legal', subtitle: 'Type & PAN' },
  { id: 'tax-address', title: 'Address & Tax', subtitle: 'Location & GST' },
  { id: 'contact', title: 'Contact Info', subtitle: 'Email & Phone' },
  { id: 'review', title: 'Review & Submit', subtitle: 'Verify Details' }
];

const STEP_GUIDES = {
  1: {
    src: guideStep1,
    alt: 'Onboarding guide presenting identity details',
    caption: 'Let’s confirm who you are'
  },
  2: {
    src: guideStep2,
    alt: 'Onboarding guide presenting address and tax details',
    caption: 'Add address and tax details'
  },
  3: {
    src: guideStep3,
    alt: 'Onboarding guide sharing contact details',
    caption: 'How can we reach you?'
  },
  4: {
    src: guideStep4,
    alt: 'Onboarding guide reviewing the checklist',
    caption: 'Quick review, then submit'
  }
};

const DEFAULT_VALUES = {
  customerDetails: {
    customerType: 'Business',
    businessLegalName: '',
    pan: ''
  },
  taxAndAddressDetails: {
    address: {
      line1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    },
    currency: 'INR',
    gstTreatment: 'Registered - Regular',
    gstin: '',
    placeOfSupply: ''
  },
  contactDetails: {
    customerLanguage: 'English',
    contactPerson: '',
    email: '',
    phone: '',
    alternatePhone: ''
  }
};

function mergeDraftValues(draftValues) {
  if (!draftValues || typeof draftValues !== 'object') {
    return DEFAULT_VALUES;
  }

  return {
    customerDetails: {
      ...DEFAULT_VALUES.customerDetails,
      ...draftValues.customerDetails
    },
    taxAndAddressDetails: {
      ...DEFAULT_VALUES.taxAndAddressDetails,
      ...draftValues.taxAndAddressDetails,
      address: {
        ...DEFAULT_VALUES.taxAndAddressDetails.address,
        ...draftValues.taxAndAddressDetails?.address
      }
    },
    contactDetails: {
      ...DEFAULT_VALUES.contactDetails,
      ...draftValues.contactDetails
    }
  };
}

export const OnboardingWizard = () => {
  const initialDraft = useMemo(() => loadDraft(), []);
  const [currentStep, setCurrentStep] = useState(initialDraft?.currentStep ?? 1);
  const [phase, setPhase] = useState(() =>
    (initialDraft?.currentStep ?? 1) > 1 ? 'wizard' : 'intro'
  );
  const [isLeavingIntro, setIsLeavingIntro] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  const currentStepRef = useRef(currentStep);
  const suppressSaveRef = useRef(false);
  const saveTimerRef = useRef(null);
  const introHoldTimerRef = useRef(null);
  const introLeaveTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      window.clearTimeout(introHoldTimerRef.current);
      window.clearTimeout(introLeaveTimerRef.current);
    };
  }, []);

  const advanceFromIntro = () => {
    window.clearTimeout(introHoldTimerRef.current);
    window.clearTimeout(introLeaveTimerRef.current);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setPhase('wizard');
      setIsLeavingIntro(false);
      return;
    }

    setIsLeavingIntro(true);
    introLeaveTimerRef.current = window.setTimeout(() => {
      setPhase('wizard');
      setIsLeavingIntro(false);
    }, INTRO_LEAVE_MS);
  };

  useEffect(() => {
    if (phase !== 'intro') return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const holdMs = prefersReducedMotion ? 900 : INTRO_HOLD_MS;

    introHoldTimerRef.current = window.setTimeout(() => {
      advanceFromIntro();
    }, holdMs);

    return () => {
      window.clearTimeout(introHoldTimerRef.current);
    };
  }, [phase]);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(completeOnboardingSubmissionSchema),
    mode: 'onTouched',
    defaultValues: mergeDraftValues(initialDraft?.values)
  });

  const formData = watch();

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const persistDraft = (step, values) => {
    if (suppressSaveRef.current) return;
    saveDraft({ currentStep: step, values });
  };

  // Debounced autosave on value changes (wizard only)
  useEffect(() => {
    if (phase !== 'wizard') return undefined;

    const subscription = watch((values) => {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => {
        persistDraft(currentStepRef.current, values);
      }, 400);
    });

    return () => {
      window.clearTimeout(saveTimerRef.current);
      subscription.unsubscribe();
    };
  }, [watch, phase]);

  // Immediate save when step changes (wizard only)
  useEffect(() => {
    if (phase !== 'wizard') return;
    persistDraft(currentStep, getValues());
  }, [currentStep, getValues, phase]);

  // Validate only the current step fields before progressing
  const handleNextStep = async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = await trigger([
        'customerDetails.customerType',
        'customerDetails.businessLegalName',
        'customerDetails.pan'
      ]);
    } else if (currentStep === 2) {
      const isRegistered =
        formData.taxAndAddressDetails?.gstTreatment === 'Registered - Regular' ||
        formData.taxAndAddressDetails?.gstTreatment === 'Registered - Composition';

      const fieldsToValidate = [
        'taxAndAddressDetails.address.line1',
        'taxAndAddressDetails.address.city',
        'taxAndAddressDetails.address.state',
        'taxAndAddressDetails.address.postalCode',
        'taxAndAddressDetails.address.country',
        'taxAndAddressDetails.currency',
        'taxAndAddressDetails.gstTreatment'
      ];

      if (isRegistered) {
        fieldsToValidate.push('taxAndAddressDetails.gstin', 'taxAndAddressDetails.placeOfSupply');
      }

      isValid = await trigger(fieldsToValidate);
    } else if (currentStep === 3) {
      isValid = await trigger([
        'contactDetails.customerLanguage',
        'contactDetails.contactPerson',
        'contactDetails.email',
        'contactDetails.phone',
        'contactDetails.alternatePhone'
      ]);
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= STEPS.length) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onFinalSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const isRegistered =
        data.taxAndAddressDetails.gstTreatment === 'Registered - Regular' ||
        data.taxAndAddressDetails.gstTreatment === 'Registered - Composition';

      const payload = {
        ...data,
        taxAndAddressDetails: {
          ...data.taxAndAddressDetails,
          gstin: isRegistered ? data.taxAndAddressDetails.gstin : null,
          placeOfSupply: isRegistered ? data.taxAndAddressDetails.placeOfSupply : null
        }
      };

      const result = await apiService.submitOnboarding(payload);
      if (result.success && result.data?.referenceId) {
        suppressSaveRef.current = true;
        window.clearTimeout(saveTimerRef.current);
        clearDraft();
        navigate(`/confirmation/${result.data.referenceId}`, {
          state: {
            submission: result.data,
            companyName: data.customerDetails.businessLegalName
          }
        });
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit onboarding form. Please check details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepGuide = STEP_GUIDES[currentStep];

  if (phase === 'intro') {
    return (
      <OnboardingIntro
        onContinue={advanceFromIntro}
        isLeaving={isLeavingIntro}
      />
    );
  }

  return (
    <div className="onboarding-page">
      <div
        className={`wizard-container glass-panel is-entering ${stepGuide ? 'has-guide' : ''}`}
      >
        <Stepper
          currentStep={currentStep}
          steps={STEPS}
          onStepClick={handleGoToStep}
        />

        <div className={`wizard-body ${stepGuide ? 'with-guide' : ''}`}>
          {stepGuide && (
            <aside className="wizard-guide" aria-hidden="true">
              <img
                key={currentStep}
                src={stepGuide.src}
                alt=""
                className="wizard-guide-image"
              />
              <p className="wizard-guide-caption">{stepGuide.caption}</p>
            </aside>
          )}

          <form
            className="wizard-form"
            onSubmit={handleSubmit(onFinalSubmit)}
            noValidate
          >
            <div key={currentStep} className="wizard-step-panel">
              {currentStep === 1 && (
                <Step1Customer
                  register={register}
                  errors={errors}
                  setValue={setValue}
                />
              )}

              {currentStep === 2 && (
                <Step2TaxAddress
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                />
              )}

              {currentStep === 3 && (
                <Step3Contact
                  register={register}
                  errors={errors}
                />
              )}

              {currentStep === 4 && (
                <Step4Review
                  formData={formData}
                  onGoToStep={handleGoToStep}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                />
              )}
            </div>

            <div className="wizard-actions">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  className="btn-nav-back"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </Button>
              )}

              <div className="wizard-actions-right">
                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    variant="primary"
                    className="btn-nav-next"
                    onClick={handleNextStep}
                  >
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    className="btn-submit-final"
                    isLoading={isSubmitting}
                  >
                    <Send size={16} />
                    <span>Confirm & Submit</span>
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
