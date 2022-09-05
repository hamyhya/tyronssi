import { useStore } from 'effector-react'
import { useTranslation } from 'next-i18next'
import { useDispatch, useSelector } from 'react-redux'
import * as tyron from 'tyron'
import Image from 'next/image'
import { Donate, OriginatorAddress } from '../../..'
import { RootState } from '../../../../src/app/reducers'
import {
    $originatorAddress,
    updateOriginatorAddress,
} from '../../../../src/store/originatorAddress'
import styles from './styles.module.scss'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { $donation, updateDonation } from '../../../../src/store/donation'
import { ZilPayBase } from '../../../ZilPay/zilpay-base'
import {
    setTxId,
    setTxStatusLoading,
    updateLoginInfoZilpay,
    UpdateNet,
} from '../../../../src/app/actions'
import {
    updateModalDashboard,
    updateModalTx,
    updateModalTxMinimized,
    updateShowZilpay,
} from '../../../../src/store/modal'
import ContinueArrow from '../../../../src/assets/icons/continue_arrow.svg'
import TickIco from '../../../../src/assets/icons/tick_blue.svg'
import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import smartContract from '../../../../src/utils/smartContract'
import React from 'react'
import { updateTxList } from '../../../../src/store/transactions'

function StakeAddFunds() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const dispatch = useDispatch()
    const originator = useStore($originatorAddress)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const [legend, setLegend] = useState('CONTINUE')
    const [input, setInput] = useState(0)
    const [hideDonation, setHideDonation] = useState(true)

    const recipient = resolvedInfo?.addr!

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(0)
        setHideDonation(true)
        setLegend('CONTINUE')
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        const input_ = Number(input)
        if (!isNaN(input_)) {
            setInput(input_)
        } else {
            toast.error(t('The input is not a number.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 1,
            })
        }
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }

    const handleSave = async () => {
        updateDonation(null)
        if (input === 0) {
            toast.error(t('The amount cannot be zero.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 1,
            })
        } else {
            setLegend('SAVED')
            setHideDonation(false)
        }
    }

    const resetOriginator = () => {
        updateOriginatorAddress(null)
        setInput(0)
        setLegend('CONTINUE')
    }

    const showSubmitBtn = () => {
        if (originator?.value === 'zilliqa' && legend === 'SAVED') {
            return true
        } else if (
            originator?.value !== 'zilliqa' &&
            donation !== null &&
            legend === 'SAVED'
        ) {
            return true
        } else {
            return false
        }
    }

    const handleConnect = React.useCallback(async () => {
        try {
            const wallet = new ZilPayBase()
            const zp = await wallet.zilpay()
            const connected = await zp.wallet.connect()

            const network = zp.wallet.net
            dispatch(UpdateNet(network))

            const address = zp.wallet.defaultAccount

            if (connected && address) {
                dispatch(updateLoginInfoZilpay(address))
                updateShowZilpay(true)
                updateModalDashboard(true)
            }

            const cache = window.localStorage.getItem(
                String(zp.wallet.defaultAccount?.base16)
            )
            if (cache) {
                updateTxList(JSON.parse(cache))
            }
        } catch (err) {
            toast.error(String(err), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        }
    }, [dispatch])

    useEffect(() => {
        setInput(0)
        setLegend('CONTINUE')
        setHideDonation(true)
    }, [originator?.value])

    const handleSubmit = async () => {
        try {
            if (originator?.value !== null) {
                const zilpay = new ZilPayBase()
                const currency = 'zil'
                const _currency = tyron.Currency.default.tyron(currency, input)
                const txID = _currency.txID
                const amount = _currency.amount

                let tx = await tyron.Init.default.transaction(net)

                dispatch(setTxStatusLoading('true'))
                // resetOriginator() @todo-x review
                updateModalTxMinimized(false)
                updateModalTx(true)
                switch (originator?.value!) {
                    case 'zilliqa':
                        await zilpay
                            .call({
                                contractAddress: recipient,
                                transition: 'AddFunds',
                                params: [],
                                amount: String(input),
                            })
                            .then(async (res) => {
                                dispatch(setTxId(res.ID))
                                dispatch(setTxStatusLoading('submitted'))
                                tx = await tx.confirm(res.ID)
                                if (tx.isConfirmed()) {
                                    dispatch(setTxStatusLoading('confirmed'))
                                    setTimeout(() => {
                                        window.open(
                                            `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                        )
                                    }, 1000)
                                } else if (tx.isRejected()) {
                                    dispatch(setTxStatusLoading('failed'))
                                }
                            })
                            .catch((err) => {
                                throw err
                            })
                    default: {
                        const addr = originator?.value
                        let beneficiary: tyron.TyronZil.Beneficiary
                        if (originator?.domain === 'did') {
                            await tyron.SearchBarUtil.default
                                .Resolve(net, addr!)
                                .then(async (res: any) => {
                                    if (
                                        Number(res?.version.slice(8, 11)) < 5.6
                                    ) {
                                        beneficiary = {
                                            constructor:
                                                tyron.TyronZil
                                                    .BeneficiaryConstructor
                                                    .Recipient,
                                            addr: recipient,
                                        }
                                    } else {
                                        beneficiary = {
                                            constructor:
                                                tyron.TyronZil
                                                    .BeneficiaryConstructor
                                                    .NftUsername,
                                            username: username,
                                            domain: domain,
                                        }
                                    }
                                })
                                .catch((err) => {
                                    throw err
                                })
                        } else {
                            beneficiary = {
                                constructor:
                                    tyron.TyronZil.BeneficiaryConstructor
                                        .NftUsername,
                                username: username,
                                domain: domain,
                            }
                        }

                        if (donation !== null) {
                            const tyron_ = await tyron.Donation.default.tyron(
                                donation
                            )
                            const tx_params =
                                await tyron.TyronZil.default.SendFunds(
                                    addr!,
                                    'AddFunds',
                                    beneficiary!,
                                    String(amount),
                                    tyron_
                                )
                            const _amount = String(donation)

                            toast.info(
                                `${t(
                                    'You’re about to transfer'
                                )} ${input} ${currency}`,
                                {
                                    position: 'top-center',
                                    autoClose: 6000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: 'dark',
                                }
                            )
                            await zilpay
                                .call({
                                    contractAddress: originator?.value!,
                                    transition: txID,
                                    params: tx_params as unknown as Record<
                                        string,
                                        unknown
                                    >[],
                                    amount: _amount,
                                })
                                .then(async (res) => {
                                    dispatch(setTxId(res.ID))
                                    dispatch(setTxStatusLoading('submitted'))
                                    tx = await tx.confirm(res.ID)
                                    if (tx.isConfirmed()) {
                                        dispatch(
                                            setTxStatusLoading('confirmed')
                                        )
                                        setTimeout(() => {
                                            window.open(
                                                `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                            )
                                        }, 1000)
                                    } else if (tx.isRejected()) {
                                        dispatch(setTxStatusLoading('failed'))
                                    }
                                })
                                .catch((err) => {
                                    throw err
                                })
                        }
                    }
                }
            }
        } catch (error) {
            dispatch(setTxStatusLoading('rejected'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            toast.error(String(error), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 12,
            })
        }
        updateOriginatorAddress(null)
        updateDonation(null)
    }

    return (
        <div className={styles.container}>
            <h4 className={styles.title}>{t('ADD FUNDS')}</h4>
            {/* <p className={styles.subTitle}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p> */}

            {loginInfo.zilAddr === null ? (
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: '65px',
                    }}
                >
                    <div
                        onClick={handleConnect}
                        className={isLight ? 'actionBtnLight' : 'actionBtn'}
                    >
                        {t('CONNECT')}
                    </div>
                </div>
            ) : (
                <div className={styles.wrapper}>
                    <div className={styles.originatorWrapper}>
                        <OriginatorAddress type="AddFundsStake" />
                    </div>
                    {originator?.value && (
                        <>
                            <div className={styles.formAmount}>
                                <input
                                    ref={callbackRef}
                                    style={{ width: '50%' }}
                                    type="text"
                                    placeholder={t('Type amount')}
                                    onChange={handleInput}
                                    onKeyPress={handleOnKeyPress}
                                    autoFocus
                                />
                                <code>ZIL</code>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginLeft: '5%',
                                    }}
                                >
                                    <div
                                        className={
                                            legend === 'CONTINUE'
                                                ? 'continueBtnBlue'
                                                : ''
                                        }
                                        onClick={() => {
                                            handleSave()
                                        }}
                                    >
                                        {legend === 'CONTINUE' ? (
                                            <Image
                                                src={ContinueArrow}
                                                alt="arrow"
                                            />
                                        ) : (
                                            <div style={{ marginTop: '5px' }}>
                                                <Image
                                                    width={40}
                                                    src={TickIco}
                                                    alt="tick"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {!hideDonation && originator?.value !== 'zilliqa' && (
                                <div
                                    style={{
                                        marginTop: '-50px',
                                        marginBottom: '-40px',
                                    }}
                                >
                                    <Donate />
                                </div>
                            )}
                            {showSubmitBtn() && (
                                <>
                                    <div className={styles.addFundsInfo}>
                                        <div>
                                            Send funds into&nbsp;
                                            <span style={{ color: '#dbe4eb' }}>
                                                {username}@{domain}.did
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        onClick={handleSubmit}
                                        style={{
                                            marginTop: '40px',
                                            width: '100%',
                                        }}
                                        className="actionBtnBlue"
                                    >
                                        <div>TRANSFER {input} ZIL</div>
                                    </div>
                                    <p className={styles.gasTxt}>
                                        {t('GAS_AROUND')} 1 ZIL
                                    </p>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default StakeAddFunds
