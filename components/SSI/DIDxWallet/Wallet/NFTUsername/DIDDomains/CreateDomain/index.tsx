import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import {
    $resolvedInfo,
    updateResolvedInfo,
} from '../../../../../../../src/store/resolvedInfo'
import { operationKeyPair } from '../../../../../../../src/lib/dkms'
import { ZilPayBase } from '../../../../../../ZilPay/zilpay-base'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { Donate, Spinner } from '../../../../../..'
import {
    $donation,
    updateDonation,
} from '../../../../../../../src/store/donation'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../../src/store/modal'
import {
    setTxStatusLoading,
    setTxId,
} from '../../../../../../../src/app/actions'
import { RootState } from '../../../../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../../src/hooks/router'
import ContinueArrow from '../../../../../../../src/assets/icons/continue_arrow.svg'
import TickIco from '../../../../../../../src/assets/icons/tick.svg'
import defaultCheckmark from '../../../../../../../src/assets/icons/default_checkmark.svg'
import selectedCheckmark from '../../../../../../../src/assets/icons/selected_checkmark.svg'
import smartContract from '../../../../../../../src/utils/smartContract'
import { $arconnect } from '../../../../../../../src/store/arconnect'
import { updateLoading } from '../../../../../../../src/store/loading'
import toastTheme from '../../../../../../../src/hooks/toastTheme'
import { is } from 'immer/dist/internal'

function Component({ dapp }: { dapp: string }) {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const { navigate } = routerHook()
    const { getSmartContract } = smartContract()
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const arConnect = useStore($arconnect)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const [didDomain, setDidDomain] = useState('') // the DID Domain
    const [input, setInput] = useState('') // the domain address
    const [legend, setLegend] = useState('save')
    const [legend2, setLegend2] = useState('save')
    const [deployed, setDeployed] = useState(false)
    const [showInput, setShowInput] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleInputDomain = (event: { target: { value: any } }) => {
        updateDonation(null)
        setInput('')
        setLegend2('save')
        const input = event.target.value
        setDidDomain(input)
    }

    const handleSaveDomain = async () => {
        if (
            didDomain !== '' &&
            didDomain !== 'did' &&
            !didDomain.includes('.')
        ) {
            setLegend2('saved')
            // setLoading(true)
            // getSmartContract(resolvedInfo?.addr!, 'did_domain_dns').then(
            //     async (res) => {
            //         const key = Object.keys(res.result.did_domain_dns)
            //         if (key.some((val) => val === didDomain)) {
            //             toast.error(t('Domain already exist'), {
            //                 position: 'top-right',
            //                 autoClose: 2000,
            //                 hideProgressBar: false,
            //                 closeOnClick: true,
            //                 pauseOnHover: true,
            //                 draggable: true,
            //                 progress: undefined,
            //                 theme: toastTheme(isLight),
            //                 toastId: 5,
            //             })
            //             setLoading(false)
            //         } else {
            //             setLegend2('saved')
            //             setLoading(false)
            //         }
            //     }
            // )
        } else {
            toast.warn(t('Invalid'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 1,
            })
        }
    }

    const handleSave = async () => {
        const addr = tyron.Address.default.verification(input)
        if (addr !== '') {
            setInput(addr)
            setLegend('saved')
        } else {
            toast.error(t('Wrong address.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 2,
            })
        }
    }

    const handleInput = (event: { target: { value: any } }) => {
        updateDonation(null)
        setInput('')
        setLegend('save')
        setInput(event.target.value)
    }

    const handleOnKeyPressAddr = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }

    const handleOnKeyPressDomain = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSaveDomain()
        }
    }

    const handleDeploy = async () => {
        if (resolvedInfo !== null && net !== null) {
            const zilpay = new ZilPayBase()
            await zilpay
                .deployDomainBeta(net, username!)
                .then((deploy: any) => {
                    let addr = deploy[1].address
                    addr = zcrypto.toChecksumAddress(addr)
                    setInput(addr)
                    setDeployed(true)
                    setLegend('saved')
                })
        } else {
            toast.error('Some data is missing.', {
                position: 'top-right',
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
        }
    }

    const handleDeployVC = async () => {
        if (resolvedInfo !== null && net !== null) {
            const zilpay = new ZilPayBase()
            await zilpay
                .deployDomainBetaVC(net, username!, didDomain)
                .then((deploy: any) => {
                    let addr = deploy[1].address
                    addr = zcrypto.toChecksumAddress(addr)
                    setInput(addr)
                    setDeployed(true)
                    setLegend('saved')
                })
        } else {
            toast.error('Some data is missing.', {
                position: 'top-right',
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
        }
    }

    const resolveDid = async (_username: string, _domain: string) => {
        updateLoading(true)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, _username, _domain)
            .then(async (addr) => {
                const res = await getSmartContract(addr, 'version')
                updateLoading(false)
                updateResolvedInfo({
                    name: _username,
                    domain: _domain,
                    addr: addr,
                    version: res.result.version,
                })
                switch (res.result.version.slice(0, 8)) {
                    case 'zilstake':
                        navigate(`/${username}/zil`)
                        break
                    case '.stake--':
                        navigate(`/${username}/zil`)
                        break
                    case 'ZILxWall':
                        navigate(`/${username}/zil`)
                        break
                    case 'VCxWalle':
                        navigate(`/${username}/sbt`)
                        break
                    case 'SBTxWall':
                        navigate(`/${username}/sbt`)
                        break
                    default:
                }
            })
            .catch((err) => {
                toast.error(String(err), {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                })
                updateLoading(false)
            })
    }

    const handleSubmit = async () => {
        try {
            if (resolvedInfo !== null && donation !== null) {
                const zilpay = new ZilPayBase()
                const txID = 'Dns'
                let addr: string
                addr = zcrypto.toChecksumAddress(input)

                let did_key: string
                let encrypted: string
                if (arConnect !== null) {
                    const result = await operationKeyPair({
                        arConnect: arConnect,
                        id: didDomain,
                        addr: resolvedInfo.addr,
                    })
                    did_key = result.element.key.key
                    encrypted = result.element.key.encrypted
                } else {
                    did_key =
                        '0x000000000000000000000000000000000000000000000000000000000000000000'
                    encrypted = didDomain
                }
                let tyron_: tyron.TyronZil.TransitionValue
                tyron_ = await tyron.Donation.default.tyron(donation)

                const tx_params = await tyron.TyronZil.default.Dns(
                    addr,
                    didDomain,
                    did_key,
                    encrypted,
                    tyron_
                )

                const _amount = String(donation)

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)
                await zilpay
                    .call({
                        contractAddress: resolvedInfo?.addr!,
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
                        try {
                            tx = await tx.confirm(res.ID)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                updateDonation(null)
                                window.open(
                                    `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                )
                                // update prev is needed here?: yes, it would be better to use global navigation
                                // we already use navigate() on resolveDid() and that's enough

                                resolveDid(username!, didDomain)
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                                setTimeout(() => {
                                    toast.error(t('Transaction failed.'), {
                                        position: 'top-right',
                                        autoClose: 3000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                        theme: toastTheme(isLight),
                                    })
                                }, 1000)
                            }
                        } catch (err) {
                            updateModalTx(false)
                            toast.error(String(err), {
                                position: 'top-right',
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                            })
                        }
                    })
                    .catch((error) => {
                        dispatch(setTxStatusLoading('rejected'))
                        updateModalTxMinimized(false)
                        updateModalTx(true)
                        toast.error(String(error), {
                            position: 'top-right',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                        })
                    })
            }
        } catch (error) {
            toast.error(String(error), {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
        }
    }

    return (
        <div style={{ textAlign: 'center' }}>
            {/*
            - dapp name depends on dapp input => if dapp = "zilstake" then title is ZIL Staking Wallet
            */}
            <p className={styles.txt}>
                DApp:{' '}
                {dapp === 'ZILxWallet'
                    ? 'ZIL Staking xWallet'
                    : 'SBTxWallet'
                    ? 'Soulbound xWallet'
                    : ''}
            </p>
            <section className={styles.container}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Type domain"
                    onChange={handleInputDomain}
                    onKeyPress={handleOnKeyPressDomain}
                    autoFocus
                />
                <code className={styles.txt}>@{username}.did</code>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '10px',
                    }}
                >
                    <div
                        className={legend2 === 'save' ? 'continueBtn' : ''}
                        onClick={() => {
                            handleSaveDomain()
                        }}
                    >
                        {legend2 === 'save' ? (
                            <>
                                {loading ? (
                                    <Spinner />
                                ) : (
                                    <Image src={ContinueArrow} alt="arrow" />
                                )}
                            </>
                        ) : (
                            <div style={{ marginTop: '5px' }}>
                                <Image width={40} src={TickIco} alt="tick" />
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {legend2 === 'saved' && (
                <>
                    {legend === 'save' && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            {dapp === 'ZILxWallet' ? (
                                <div
                                    className={
                                        isLight
                                            ? 'actionBtnBlueLight'
                                            : 'actionBtnBlue'
                                    }
                                    style={{ margin: '10%' }}
                                    onClick={handleDeploy}
                                >
                                    <span style={{ textTransform: 'none' }}>
                                        New ZILxWallet
                                    </span>
                                </div>
                            ) : (
                                <div
                                    className={
                                        isLight ? 'actionBtnLight' : 'actionBtn'
                                    }
                                    style={{ margin: '10%' }}
                                    onClick={() => {
                                        if (net === 'testnet') {
                                            handleDeployVC()
                                        } else {
                                            toast.warn(
                                                'Only available on testnet.'
                                            ),
                                                {
                                                    position: 'top-right',
                                                    autoClose: 2000,
                                                    hideProgressBar: false,
                                                    closeOnClick: true,
                                                    pauseOnHover: true,
                                                    draggable: true,
                                                    progress: undefined,
                                                    theme: toastTheme(isLight),
                                                    toastId: 3,
                                                }
                                        }
                                    }}
                                >
                                    <span style={{ textTransform: 'none' }}>
                                        NEW SBTxWallet
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    {!deployed && (
                        <div style={{ marginTop: '5%' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <div
                                    onClick={() => setShowInput(!showInput)}
                                    className={styles.optionIco}
                                >
                                    <Image
                                        src={
                                            showInput
                                                ? selectedCheckmark
                                                : defaultCheckmark
                                        }
                                        alt="arrow"
                                    />
                                </div>
                                <div className={styles.txt}>
                                    Or type the address you want to save in your
                                    DID Domain.
                                </div>
                            </div>
                            {showInput && (
                                <section className={styles.container}>
                                    <input
                                        style={{
                                            width: '70%',
                                            marginRight: '20px',
                                        }}
                                        className={styles.txt}
                                        type="text"
                                        placeholder="Type address"
                                        onChange={handleInput}
                                        onKeyPress={handleOnKeyPressAddr}
                                        autoFocus
                                    />
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <div
                                            className={
                                                legend === 'save'
                                                    ? 'continueBtn'
                                                    : ''
                                            }
                                            onClick={() => {
                                                handleSave()
                                            }}
                                        >
                                            {legend === 'save' ? (
                                                <Image
                                                    src={ContinueArrow}
                                                    alt="arrow"
                                                />
                                            ) : (
                                                <div
                                                    style={{ marginTop: '5px' }}
                                                >
                                                    <Image
                                                        width={40}
                                                        src={TickIco}
                                                        alt="tick"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                    {legend === 'saved' && <Donate />}
                    {legend === 'saved' && donation !== null && (
                        <div style={{ marginTop: '14%', textAlign: 'center' }}>
                            <button className="button" onClick={handleSubmit}>
                                <p>
                                    Save{' '}
                                    <span className={styles.username}>
                                        {didDomain}
                                    </span>{' '}
                                    DID Domain
                                </p>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
